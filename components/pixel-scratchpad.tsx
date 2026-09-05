'use client';

/* oxlint-disable jsx-a11y/no-noninteractive-element-to-interactive-role -- This native table is an ARIA drawing grid with arrow-key navigation and one tab stop. */

import {
  useEffect,
  useId,
  useReducer,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';

import {
  createPixelPadState,
  pixelPadReducer,
  PIXEL_PAD_COLUMNS,
  PIXEL_PAD_ROWS,
} from '@/lib/pixel-pad.mjs';
import {
  parsePixelDrawing,
  PIXEL_PAD_STORAGE_KEY,
  serializePixelDrawing,
} from '@/lib/pixel-pad-storage.mjs';

type Point = { x: number; y: number };
type PadState = ReturnType<typeof createPixelPadState>;
type PadAction = Parameters<typeof pixelPadReducer>[1];

function persistentPadReducer(
  state: PadState,
  action: PadAction | { type: 'restore'; pixels: boolean[] },
): PadState {
  if (action.type === 'restore') {
    return { pixels: action.pixels, history: [], strokeStart: null };
  }
  return pixelPadReducer(state, action);
}

export function PixelScratchpad() {
  const id = useId();
  const [state, dispatch] = useReducer(
    persistentPadReducer,
    undefined,
    createPixelPadState,
  );
  const [tool, setTool] = useState<'draw' | 'erase'>('draw');
  const [active, setActive] = useState<Point>({ x: 0, y: 0 });
  const [saveMessage, setSaveMessage] = useState('');
  const [storageReady, setStorageReady] = useState(false);
  const [storageMessage, setStorageMessage] = useState('');
  const grid = useRef<HTMLTableElement>(null);
  const stroke = useRef<{
    pointerId: number;
    point: Point;
    filled: boolean;
  } | null>(null);
  const count = state.pixels.filter(Boolean).length;

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      try {
        const saved = parsePixelDrawing(
          window.localStorage.getItem(PIXEL_PAD_STORAGE_KEY),
        );
        if (saved) dispatch({ type: 'restore', pixels: saved });
        // State, rather than a ref, keeps saving gated until the restored
        // drawing and readiness flag have been committed in the same render.
        setStorageReady(true);
      } catch {
        setStorageMessage('Auto-save unavailable. Save a PNG to keep it.');
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    const drawing = serializePixelDrawing(state.pixels);
    if (!drawing) return;
    let message: string;
    try {
      window.localStorage.setItem(PIXEL_PAD_STORAGE_KEY, drawing);
      message = 'Saved on this device.';
    } catch {
      message = 'Auto-save unavailable. Save a PNG to keep it.';
    }
    // The write is immediate; defer only its UI receipt to avoid another
    // synchronous render inside an effect on every pointer sample.
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setStorageMessage(message);
    });
    return () => {
      cancelled = true;
    };
  }, [state.pixels, storageReady]);

  const getPoint = (event: PointerEvent<HTMLTableElement>): Point => {
    const bounds = event.currentTarget.getBoundingClientRect();
    return {
      x: Math.max(
        0,
        Math.min(
          PIXEL_PAD_COLUMNS - 1,
          Math.floor(
            ((event.clientX - bounds.left) / bounds.width) * PIXEL_PAD_COLUMNS,
          ),
        ),
      ),
      y: Math.max(
        0,
        Math.min(
          PIXEL_PAD_ROWS - 1,
          Math.floor(
            ((event.clientY - bounds.top) / bounds.height) * PIXEL_PAD_ROWS,
          ),
        ),
      ),
    };
  };

  const startStroke = (event: PointerEvent<HTMLTableElement>) => {
    if (!event.isPrimary || event.button !== 0 || stroke.current) return;
    event.preventDefault();
    event.currentTarget.focus({ preventScroll: true });
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = getPoint(event);
    const filled = tool === 'draw';
    stroke.current = { pointerId: event.pointerId, point, filled };
    setActive(point);
    setSaveMessage('');
    dispatch({ type: 'begin', point, filled });
  };

  const continueStroke = (event: PointerEvent<HTMLTableElement>) => {
    const current = stroke.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const point = getPoint(event);
    if (point.x === current.point.x && point.y === current.point.y) return;
    dispatch({
      type: 'paint',
      from: current.point,
      to: point,
      filled: current.filled,
    });
    stroke.current = { ...current, point };
    setActive(point);
  };

  const endStroke = (event: PointerEvent<HTMLTableElement>) => {
    if (stroke.current?.pointerId !== event.pointerId) return;
    stroke.current = null;
    dispatch({ type: 'finish' });
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const moveWithKeyboard = (event: KeyboardEvent<HTMLTableElement>) => {
    if (event.altKey || event.metaKey || event.ctrlKey) return;
    let { x, y } = active;
    switch (event.key) {
      case 'ArrowLeft':
        x = Math.max(0, x - 1);
        break;
      case 'ArrowRight':
        x = Math.min(PIXEL_PAD_COLUMNS - 1, x + 1);
        break;
      case 'ArrowUp':
        y = Math.max(0, y - 1);
        break;
      case 'ArrowDown':
        y = Math.min(PIXEL_PAD_ROWS - 1, y + 1);
        break;
      case 'Home':
        x = 0;
        break;
      case 'End':
        x = PIXEL_PAD_COLUMNS - 1;
        break;
      case ' ':
      case 'Enter':
        dispatch({ type: 'toggle', point: active });
        setSaveMessage('');
        break;
      default:
        return;
    }
    event.preventDefault();
    setActive({ x, y });
  };

  const saveImage = () => {
    const canvas = document.createElement('canvas');
    const scale = 32;
    canvas.width = PIXEL_PAD_COLUMNS * scale;
    canvas.height = PIXEL_PAD_ROWS * scale;
    const context = canvas.getContext('2d');
    if (!context || !grid.current) {
      setSaveMessage('The image could not be saved in this browser.');
      return;
    }
    context.imageSmoothingEnabled = false;
    context.fillStyle = '#e7cb57';
    context.fillStyle = getComputedStyle(grid.current).color;
    state.pixels.forEach((filled, index) => {
      if (filled)
        context.fillRect(
          (index % PIXEL_PAD_COLUMNS) * scale,
          Math.floor(index / PIXEL_PAD_COLUMNS) * scale,
          scale,
          scale,
        );
    });
    canvas.toBlob((blob) => {
      if (!blob) {
        setSaveMessage('The image could not be saved in this browser.');
        return;
      }
      const url = URL.createObjectURL(blob);
      const download = document.createElement('a');
      download.href = url;
      download.download = 'a-few-pixels.png';
      document.body.append(download);
      download.click();
      download.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setSaveMessage('PNG ready. Nothing was uploaded.');
    }, 'image/png');
  };

  return (
    <section className="pixel-pad" aria-labelledby={`${id}-title`}>
      <header className="pixel-pad__heading">
        <div>
          <h3 id={`${id}-title`}>Pixel scratchpad</h3>
        </div>
        <span
          className="pixel-pad__dimensions"
          aria-label="16 columns by 10 rows"
        >
          16 × 10
        </span>
      </header>

      <div className="pixel-pad__tools" aria-label="Drawing tools">
        <fieldset
          className="pixel-pad__modes"
          aria-label="Choose a drawing tool"
        >
          <button
            type="button"
            aria-pressed={tool === 'draw'}
            onClick={() => setTool('draw')}
          >
            Draw
          </button>
          <button
            type="button"
            aria-pressed={tool === 'erase'}
            onClick={() => setTool('erase')}
          >
            Erase
          </button>
        </fieldset>
        <button
          type="button"
          disabled={!state.history.length}
          onClick={() => {
            dispatch({ type: 'undo' });
            setSaveMessage('');
          }}
        >
          Undo
        </button>
        <button
          type="button"
          disabled={!count}
          onClick={() => {
            dispatch({ type: 'clear' });
            setSaveMessage('');
          }}
        >
          Clear
        </button>
      </div>

      <div className="pixel-pad__frame">
        <table
          className="pixel-pad__grid"
          ref={grid}
          role="grid"
          aria-label="Pixel drawing canvas"
          aria-rowcount={PIXEL_PAD_ROWS}
          aria-colcount={PIXEL_PAD_COLUMNS}
          aria-multiselectable="true"
          aria-describedby={`${id}-keys`}
          aria-activedescendant={`${id}-pixel-${active.y * PIXEL_PAD_COLUMNS + active.x}`}
          tabIndex={0}
          onPointerDown={startStroke}
          onPointerMove={continueStroke}
          onPointerUp={endStroke}
          onPointerCancel={endStroke}
          onLostPointerCapture={endStroke}
          onKeyDown={moveWithKeyboard}
        >
          <tbody className="pixel-pad__rows">
            {Array.from({ length: PIXEL_PAD_ROWS }, (_, y) => (
              <tr className="pixel-pad__row" aria-rowindex={y + 1} key={y}>
                {Array.from({ length: PIXEL_PAD_COLUMNS }, (_, x) => {
                  const index = y * PIXEL_PAD_COLUMNS + x;
                  const filled = state.pixels[index];
                  return (
                    <td
                      className="pixel-pad__pixel"
                      id={`${id}-pixel-${index}`}
                      aria-colindex={x + 1}
                      aria-selected={filled}
                      aria-label={`Row ${y + 1}, column ${x + 1}, ${filled ? 'filled' : 'empty'}`}
                      data-filled={filled ? '' : undefined}
                      data-active={
                        x === active.x && y === active.y ? '' : undefined
                      }
                      key={x}
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pixel-pad__footer">
        <span>
          {count} / {PIXEL_PAD_COLUMNS * PIXEL_PAD_ROWS} pixels
        </span>
        <button type="button" onClick={saveImage} disabled={!count}>
          Save PNG <span aria-hidden="true">↓</span>
        </button>
      </div>
      <p className="pixel-pad__keys" id={`${id}-keys`}>
        Drag to draw. <kbd>Arrows</kbd> move · <kbd>Space</kbd> toggles.
      </p>
      <output className="pixel-pad__status">
        {saveMessage || storageMessage}
      </output>
    </section>
  );
}
