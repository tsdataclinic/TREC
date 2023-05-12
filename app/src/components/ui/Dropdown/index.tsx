import * as React from 'react';
import * as IconType from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMemo } from 'react';
import styled from 'styled-components';
import * as Select from '@radix-ui/react-select';

export const StyledTriggerButton = styled(Select.Trigger)`
  all: unset;
  background-color: #edf1f2;
  box-sizing: border-box;
  display: flex;
  padding: 6px 15px;

  &:hover {
    background-color: #dee6e7;
  }

  &:focus {
    // blue outline on focus
    box-shadow: 0 0 0 2px #3b82f6;
  }

  &[data-disabled] {
    color: #94a3b8;
    cursor: not-allowed;
    &:hover {
      !background-color: inherit;
    }
  }
`;

const StyledValueDiv = styled.div`
  flex: 1;
  text-align: left;
`;

const StyledSelectContent = styled(Select.Content)`
  background-color: white;
  box-shadow: 0px 10px 38px -10px rgba(22, 23, 24, 0.35),
    0px 10px 20px -15px rgba(22, 23, 24, 0.2);
  overflow: hidden;
  z-index: 9999;
`;

const StyledSelectViewport = styled(Select.Viewport)`
  padding: 5px;
`;

const StyledSelectItem = styled(Select.Item)`
  align-items: center;
  all: unset;
  cursor: pointer;
  display: flex;
  padding: 4px 35px 4px 25px;
  position: relative;
  user-select: none;

  &[data-highlighted] {
    color: white;
    background: #6d93b5;
  }

  &[data-disabled] {
    color: #94a3b8;
    cursor: unset;
  }
`;

const StyledItemIndicator = styled(Select.ItemIndicator)`
  align-items: center;
  display: inline-flex;
  justify-content: center;
  height: 100%;
  left: 0;
  position: absolute;
  width: 25px;
  top: 0;
`;

type Props<T> = {
  ariaLabel?: string;
  className?: string;
  defaultValue?: T | undefined;
  disabled?: boolean;
  id?: string;
  name?: string;
  onChange?: (value: T) => void;
  options: ReadonlyArray<{
    disabled?: boolean;
    displayValue: React.ReactNode;
    value: T;
  }>;
  /**
   * The button label to display when no option is selected.
   * This will also be the default value for `ariaLabel` too.
   */
  placeholder?: string;
  value?: T | undefined;
};

export default function Dropdown<T extends string>({
  ariaLabel,
  className,
  defaultValue,
  placeholder,
  name,
  onChange,
  options,
  value,
  id,
  disabled,
}: Props<T>): JSX.Element {
  const ariaLabelToUse = ariaLabel ?? placeholder;
  const selectItems = useMemo(
    () =>
      options.map(obj => (
        <StyledSelectItem
          key={obj.value}
          value={obj.value}
          disabled={!!obj.disabled}
        >
          <Select.ItemText>{obj.displayValue}</Select.ItemText>
          <StyledItemIndicator>
            <FontAwesomeIcon icon={IconType.faCheck} size="sm" />
          </StyledItemIndicator>
        </StyledSelectItem>
      )),
    [options],
  );

  return (
    <Select.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={onChange}
      name={name}
    >
      <StyledTriggerButton
        id={id}
        aria-label={ariaLabelToUse}
        disabled={disabled}
        className={className}
      >
        <StyledValueDiv>
          <Select.Value placeholder={placeholder} />
        </StyledValueDiv>
        <Select.Icon>
          <FontAwesomeIcon
            style={{ marginLeft: 8 }}
            icon={IconType.faChevronDown}
            size="xs"
          />
        </Select.Icon>
      </StyledTriggerButton>

      <Select.Portal>
        <StyledSelectContent>
          <StyledSelectViewport>{selectItems}</StyledSelectViewport>
        </StyledSelectContent>
      </Select.Portal>
    </Select.Root>
  );
}
