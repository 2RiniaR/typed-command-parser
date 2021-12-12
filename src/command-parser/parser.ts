import { interpretCommand, InterpretFormat, InterpretResult } from "./interpreter";
import {convertParameter, ConvertType, SupportTypes} from "./converter";
import {
  CommandFormatArguments,
  CommandFormatOptions,
  ConvertPatternSet
} from "./base-types";

export type ConvertTypeSet<TConvertPatternSet extends ConvertPatternSet> = {
  [key in keyof TConvertPatternSet]: ConvertType<TConvertPatternSet[key]>;
};

export type ConvertTypeSetBase = {
  [key: string]: ConvertType<SupportTypes>;
};

export type ConvertPatternSetOf<TConvertTypeSet extends ConvertTypeSetBase> = {
  [key in keyof TConvertTypeSet]: Exclude<ReturnType<TConvertTypeSet[key]["converter"]>, undefined>
};

export type CommandFormatDefault<TConvertPatternSet extends ConvertPatternSet> = CommandFormat<
  TConvertPatternSet,
  CommandFormatArguments<TConvertPatternSet>,
  CommandFormatOptions<TConvertPatternSet>
>;

export type CommandFormatOn<TConvertTypeSet extends ConvertTypeSetBase> = CommandFormat<
  ConvertPatternSetOf<TConvertTypeSet>,
  CommandFormatArguments<ConvertPatternSetOf<TConvertTypeSet>>,
  CommandFormatOptions<ConvertPatternSetOf<TConvertTypeSet>>
>;

export type CommandFormat<
  TConvertPatternSet extends ConvertPatternSet,
  TArguments extends CommandFormatArguments<TConvertPatternSet>,
  TOptions extends CommandFormatOptions<TConvertPatternSet>
> = {
  readonly prefixes: readonly string[];
  readonly arguments: TArguments;
  readonly options: TOptions;
};

export type CommandResult<
  TConvertPatternSet extends ConvertPatternSet,
  TArguments extends CommandFormatArguments<TConvertPatternSet>,
  TOptions extends CommandFormatOptions<TConvertPatternSet>
> = {
  readonly prefix: string;
  readonly arguments: CommandResultArguments<TConvertPatternSet, TArguments>;
  readonly options: CommandResultOptions<TConvertPatternSet, TOptions>;
};

export type CommandResultOf<
  TConvertTypeSet extends ConvertTypeSetBase,
  TFormat extends CommandFormat<ConvertPatternSetOf<TConvertTypeSet>, CommandFormatArguments<ConvertPatternSetOf<TConvertTypeSet>>, CommandFormatOptions<ConvertPatternSetOf<TConvertTypeSet>>>,
> = CommandResult<ConvertPatternSetOf<TConvertTypeSet>, TFormat["arguments"], TFormat["options"]>;

type Parameter<TConvertPatternSet extends ConvertPatternSet = ConvertPatternSet> = {
  readonly name: string;
  readonly description: string;
  readonly type: keyof TConvertPatternSet;
};

type CommandResultArguments<
  TConvertPatternSet extends ConvertPatternSet,
  TArguments extends CommandFormatArguments<TConvertPatternSet>
> = TArguments[0] extends Parameter<TConvertPatternSet>
  ? TArguments[1] extends Parameter<TConvertPatternSet>
    ? TArguments[2] extends Parameter<TConvertPatternSet>
      ? TArguments[3] extends Parameter<TConvertPatternSet>
        ? TArguments[4] extends Parameter<TConvertPatternSet>
          ? [
              TConvertPatternSet[TArguments[0]["type"]],
              TConvertPatternSet[TArguments[1]["type"]],
              TConvertPatternSet[TArguments[2]["type"]],
              TConvertPatternSet[TArguments[3]["type"]],
              TConvertPatternSet[TArguments[4]["type"]]
            ]
          : [
              TConvertPatternSet[TArguments[0]["type"]],
              TConvertPatternSet[TArguments[1]["type"]],
              TConvertPatternSet[TArguments[2]["type"]],
              TConvertPatternSet[TArguments[3]["type"]]
            ]
        : [
            TConvertPatternSet[TArguments[0]["type"]],
            TConvertPatternSet[TArguments[1]["type"]],
            TConvertPatternSet[TArguments[2]["type"]]
          ]
      : [TConvertPatternSet[TArguments[0]["type"]], TConvertPatternSet[TArguments[1]["type"]]]
    : [TConvertPatternSet[TArguments[0]["type"]]]
  : [];

type CommandResultOptions<
  TConvertPatternSet extends ConvertPatternSet,
  TOptions extends CommandFormatOptions<TConvertPatternSet>
> = {
  [key in keyof TOptions]?: TConvertPatternSet[TOptions[key]["type"]];
};

/*

function convertArguments<
  TConvertPatternSet extends ConvertPatternSet,
  TArguments extends CommandFormatArguments<TConvertPatternSet>,
  TOptions extends CommandFormatOptions<TConvertPatternSet>
>(
  values: InterpretResult<TConvertPatternSet, TArguments, TOptions>,
  format: CommandFormat<TConvertPatternSet, TArguments, TOptions>,
  types: ConvertTypeSet<TConvertPatternSet>
): CommandResultArguments<TConvertPatternSet, TArguments> {
  const parameters = values.arguments.map((argument, index) => {
    const fmt = format.arguments[index];
    if (!fmt) throw Error();
    const param = {
      name: `${(index + 1).toString()} 番目の引数`,
      description: fmt.description,
      value: values.arguments[index],
      convertType: types[fmt.type]
    };
    return convertParameter(param);
  });
  return parameters as CommandResultArguments<TConvertPatternSet, TArguments>;
}

function convertOptions<
  TConvertPatternSet extends ConvertPatternSet,
  TArguments extends CommandFormatArguments<TConvertPatternSet>,
  TOptions extends CommandFormatOptions<TConvertPatternSet>
>(
  values: InterpretResult<TConvertPatternSet, TArguments, TOptions>,
  format: CommandFormat<TConvertPatternSet, TArguments, TOptions>,
  types: ConvertTypeSet<TConvertPatternSet>
): CommandResultOptions<TConvertPatternSet, TOptions> {
  const init: CommandResultOptions<TConvertPatternSet, TOptions> = {};
  return Object.keys(format.options).reduce((prev, curr) => {
    const key = curr as keyof TOptions;
    const value: string | undefined = values.options[key];
    if (!value) return prev;
    const param = {
      name: `オプション ${curr}`,
      description: format.options[key].description,
      value: value,
      convertType: types[format.options[key].type]
    };

    prev[key] = convertParameter(param);
    return prev;
  }, init);
}

export function parseCommand<
  TConvertPatternSet extends ConvertPatternSet,
  TArguments extends CommandFormatArguments<TConvertPatternSet>,
  TOptions extends CommandFormatOptions<TConvertPatternSet>
>(
  command: string,
  format: CommandFormat<TConvertPatternSet, TArguments, TOptions>,
  types: ConvertTypeSet<TConvertPatternSet>
): CommandResult<TConvertPatternSet, TArguments, TOptions> | undefined {
  const interpretFormat: InterpretFormat<TConvertPatternSet, TArguments, TOptions> = {
    prefixes: format.prefixes,
    argumentsCount: format.arguments,
    optionsName: format.options
  } as const;
  const interpretation = interpretCommand<TConvertPatternSet, TArguments, TOptions>(command, interpretFormat);
  if (!interpretation) return;

  return {
    prefix: interpretation.prefix,
    arguments: convertArguments<TConvertPatternSet, TArguments, TOptions>(
      interpretation,
      format,
      types
    ),
    options: convertOptions<TConvertPatternSet, TArguments, TOptions>(interpretation, format, types)
  };
}

export function parseCommandInfer<
  TConvertTypeSet extends ConvertTypeSetBase,
  TFormat extends CommandFormat<
    ConvertPatternSetOf<TConvertTypeSet>,
    CommandFormatArguments<ConvertPatternSetOf<TConvertTypeSet>>,
    CommandFormatOptions<ConvertPatternSetOf<TConvertTypeSet>>
  >
>(
  command: string,
  format: TFormat,
  types: TConvertTypeSet
): CommandResultOf<TConvertTypeSet, TFormat> | undefined {
  return parseCommand<
    ConvertPatternSetOf<TConvertTypeSet>,
    TFormat["arguments"],
    TFormat["options"]
  >(command, format, types);
}
*/

function convertArguments<
  TConvertTypeSet extends ConvertTypeSetBase,
  TArguments extends CommandFormatArguments<ConvertPatternSetOf<TConvertTypeSet>>,
  TOptions extends CommandFormatOptions<ConvertPatternSetOf<TConvertTypeSet>>
  >(
  values: InterpretResult<ConvertPatternSetOf<TConvertTypeSet>, TArguments, TOptions>,
  format: CommandFormat<ConvertPatternSetOf<TConvertTypeSet>, TArguments, TOptions>,
  types: TConvertTypeSet
): CommandResultArguments<ConvertPatternSetOf<TConvertTypeSet>, TArguments> {
  const parameters = values.arguments.map((argument, index) => {
    const fmt = format.arguments[index];
    if (!fmt) throw Error();
    const param = {
      name: `${(index + 1).toString()} 番目の引数`,
      description: fmt.description,
      value: values.arguments[index],
      convertType: types[fmt.type]
    };
    return convertParameter(param);
  });
  return parameters as CommandResultArguments<ConvertPatternSetOf<TConvertTypeSet>, TArguments>;
}

function convertOptions<
  TConvertTypeSet extends ConvertTypeSetBase,
  TArguments extends CommandFormatArguments<ConvertPatternSetOf<TConvertTypeSet>>,
  TOptions extends CommandFormatOptions<ConvertPatternSetOf<TConvertTypeSet>>
  >(
  values: InterpretResult<ConvertPatternSetOf<TConvertTypeSet>, TArguments, TOptions>,
  format: CommandFormat<ConvertPatternSetOf<TConvertTypeSet>, TArguments, TOptions>,
  types: TConvertTypeSet
): CommandResultOptions<ConvertPatternSetOf<TConvertTypeSet>, TOptions> {
  const init: CommandResultOptions<ConvertPatternSetOf<TConvertTypeSet>, TOptions> = {};
  return Object.keys(format.options).reduce((prev, curr) => {
    const key = curr as keyof TOptions;
    const value: string | undefined = values.options[key];
    if (!value) return prev;
    const param = {
      name: `オプション ${curr}`,
      description: format.options[key].description,
      value: value,
      convertType: types[format.options[key].type]
    };

    prev[key] = convertParameter(param);
    return prev;
  }, init);
}

export function parseCommand<
  TConvertTypeSet extends ConvertTypeSetBase,
  TFormat extends CommandFormat<
    ConvertPatternSetOf<TConvertTypeSet>,
    CommandFormatArguments<ConvertPatternSetOf<TConvertTypeSet>>,
    CommandFormatOptions<ConvertPatternSetOf<TConvertTypeSet>>
    >
  >(
  command: string,
  format: TFormat,
  types: TConvertTypeSet
): CommandResultOf<TConvertTypeSet, TFormat> | undefined {
  const interpretFormat: InterpretFormat<
    ConvertPatternSetOf<TConvertTypeSet>,
    TFormat["arguments"],
    TFormat["options"]
  > = {
    prefixes: format.prefixes,
    argumentsCount: format.arguments,
    optionsName: format.options
  } as const;

  const interpretation = interpretCommand<
    ConvertPatternSetOf<TConvertTypeSet>,
    TFormat["arguments"],
    TFormat["options"]
  >(command, interpretFormat);
  if (!interpretation) return;

  return {
    prefix: interpretation.prefix,
    arguments: convertArguments<TConvertTypeSet, TFormat["arguments"], TFormat["options"]>(
      interpretation,
      format,
      types
    ),
    options: convertOptions<TConvertTypeSet, TFormat["arguments"], TFormat["options"]>(interpretation, format, types)
  };
}
