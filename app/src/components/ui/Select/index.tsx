import type { ReactNode } from "react";
import ReactSelect from 'react-select';

type Props = {
  children?: ReactNode;
  className?: string;
  onChange?: (e: any) => void;
  defaultValue: string,
  options: Array<any>
};

export default function Select({
  children,
  className,
  onChange,
  defaultValue,
  options
}: Props): JSX.Element {

  return (
    <ReactSelect
        className={className}
        onChange={onChange}
        isLoading={options.length === 0}
        defaultValue={defaultValue}
        defaultInputValue={defaultValue}
        placeholder={defaultValue}
        options={options}
     />
  );
}
