import type { ReactNode } from "react";
import ReactSelect from 'react-select';
import { CityRecord } from "../../../hooks/useAvailableCities";

type Props = {
  children?: ReactNode;
  className?: string;
  onChange?: (e: any) => void;
  defaultValue: string,
  options: Array<CityRecord>,
  isLoading: string,
  selectedCity: CityRecord
};

export default function Select({
  children,
  className,
  onChange,
  defaultValue,
  options,
  isLoading,
  selectedCity
}: Props): JSX.Element {

  return (
    <ReactSelect
        tabSelectsValue
        className={className}
        onChange={onChange}
        isLoading={isLoading === 'loading'}
        placeholder={defaultValue}
        options={options}
        getOptionValue={(option) => option.msa_id}
        getOptionLabel={(option) => option.msa_name}
     />
  );
}
