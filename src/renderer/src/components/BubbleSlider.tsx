import {
  type ChangeEventHandler,
  type FC,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { formatDecimal } from '~/shared'

import { useBubbleSliderStyles } from './BubbleSlider.styles.js'

export type BubbleSliderProps = {
  value: number
  min?: number
  max?: number
  step?: string
  onChange: (value: number) => void
  ariaLabel: string
  hideBubble?: boolean
  disabled?: boolean
}

export const BubbleSlider: FC<BubbleSliderProps> = function BubbleSilder({
  value: v = 0,
  min = 0,
  max = 100,
  step = '1',
  onChange,
  ariaLabel,
  hideBubble = false,
  disabled = false,
}) {
  const styles = useBubbleSliderStyles()
  const [value, setValue] = useState(v)
  const [left, setLeft] = useState('0%')

  useEffect(() => {
    setValue(v)
  }, [v])

  const bubbleStyles = useMemo(() => {
    return {
      left: left,
    }
  }, [left])

  const calculateLeft = useCallback(
    (value: number) => {
      const slideVal = Number(((value - min) * 100) / (max - min))
      const newPosition = 10 - slideVal * 0.2
      return `calc(${slideVal}% + (${newPosition}px))`
    },
    [min, max],
  )

  useEffect(() => {
    const left = calculateLeft(value)
    setLeft(left)
  }, [calculateLeft, setLeft, value])

  const onSlide: ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      const rangeVal = +e.target.value
      onChange(rangeVal)
    },
    [onChange],
  )

  return (
    <div className={styles.sliderArea}>
      <input
        className={styles.slider}
        type="range"
        aria-label={ariaLabel}
        step={step}
        min={min}
        max={max}
        value={value}
        onChange={onSlide}
        disabled={disabled}
      />
      {!hideBubble && (
        <div
          aria-disabled={disabled}
          style={bubbleStyles}
          className={styles.bubble}
        >
          {formatDecimal(value)}
        </div>
      )}
    </div>
  )
}
