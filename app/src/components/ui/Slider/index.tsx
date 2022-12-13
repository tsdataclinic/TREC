import * as RadixSlider from '@radix-ui/react-slider';
import styled from 'styled-components';

type Props = {
  onValueChange: (value: number[]) => void;
  label: React.ReactNode;
  value: readonly number[];
  orientation: 'horizontal' | 'vertical';
};

const APP_SLATE_COLOR = '#33424e';

const StyledSlider = styled(RadixSlider.Root)`
  align-items: center;
  display: flex;
  position: relative;
  touch-action: none;
  user-select: none;

  &[data-orientation='horizontal'] {
    height: 28px;
    width: 100%;
  }

  &[data-orientation='vertical'] {
    flex-direction: column;
    height: 100%;
    width: 28px;
  }
`;

const StyledSliderTrack = styled(RadixSlider.Track)`
  background-color: ${APP_SLATE_COLOR};
  border-radius: 9999px;
  flex-grow: 1;
  position: relative;

  &[data-orientation='horizontal'] {
    height: 3px;
    width: 100%;
  }

  &[data-orientation='vertical'] {
    height: 100%;
    width: 3px;
  }
`;

const StyledSliderRange = styled(RadixSlider.Range)`
  background-color: ${APP_SLATE_COLOR};
  border-radius: 9999px;
  height: 100%;
  position: absolute;
`;

const StyledSliderThumb = styled(RadixSlider.Thumb)`
  background-color: ${APP_SLATE_COLOR};
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.33);
  border-radius: 10px;
  display: block;
  height: 16px;
  width: 16px;
  transition: all 150ms;

  &:hover {
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.6);
  }
`;

export default function Slider({
  label,
  value,
  onValueChange,
  orientation,
}: Props): JSX.Element {
  return (
    <>
      <span className="text-xs">{label}</span>
      <StyledSlider
        value={value as number[]}
        onValueChange={onValueChange}
        min={0}
        max={2}
        orientation={orientation}
      >
        <StyledSliderTrack>
          <StyledSliderRange />
        </StyledSliderTrack>
        <StyledSliderThumb />
      </StyledSlider>
    </>
  );
}
