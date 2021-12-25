import { labelCommand } from "./label";
import { CommandResult, convertArguments, convertOptions, ConvertType, SupportTypes } from "./converter";
import { CommandFormatArguments, CommandFormatOptions } from "./base-types";
import { CommandFragments } from "../fragment";

export type ConvertTypeSetBase = {
  readonly [key: string]: ConvertType<SupportTypes>;
};

export type TypeToReturn<TConvertType extends ConvertType<SupportTypes>> = Exclude<
  ReturnType<TConvertType["converter"]>,
  undefined
>;

export type CommandFormatOn<TConvertTypeSet extends ConvertTypeSetBase> = CommandFormat<
  TConvertTypeSet,
  CommandFormatArguments<TConvertTypeSet>,
  CommandFormatOptions<TConvertTypeSet>
>;

export type CommandFormat<
  TConvertTypeSet extends ConvertTypeSetBase,
  TArguments extends CommandFormatArguments<TConvertTypeSet>,
  TOptions extends CommandFormatOptions<TConvertTypeSet>
> = {
  readonly prefixes: readonly string[];
  readonly arguments: TArguments;
  readonly options: TOptions;
};

export type CommandResultOf<
  TConvertTypeSet extends ConvertTypeSetBase,
  TFormat extends CommandFormat<
    TConvertTypeSet,
    CommandFormatArguments<TConvertTypeSet>,
    CommandFormatOptions<TConvertTypeSet>
  >
> = CommandResult<TConvertTypeSet, TFormat["arguments"], TFormat["options"]>;

export function interpretCommand<
  TConvertTypeSet extends ConvertTypeSetBase,
  TFormat extends CommandFormatOn<TConvertTypeSet>
>(fragment: CommandFragments, format: TFormat, types: TConvertTypeSet): CommandResultOf<TConvertTypeSet, TFormat> {
  const interpretFormat = {
    prefixes: format.prefixes,
    argumentsCount: format.arguments,
    optionsName: format.options
  } as const;

  const interpretation = labelCommand<TConvertTypeSet, TFormat>(fragment, interpretFormat);
  return {
    prefix: interpretation.prefix,
    arguments: convertArguments(interpretation, format, types),
    options: convertOptions(interpretation, format, types)
  };
}
