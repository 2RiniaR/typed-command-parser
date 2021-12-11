import { CommandParserError } from "./error-base";

export class InvalidFormatError<TReturn extends SupportTypes> extends CommandParserError {
  public readonly parameter: ConvertParameter<TReturn>;

  public constructor(parameter: ConvertParameter<TReturn>) {
    super();
    this.parameter = parameter;
    this.message = `引数の形式が違います。\n${parameter.name} には ${parameter.convertType.name} を入力してください。`;
  }
}

export type SupportTypes = number | string | boolean | object;

export type ConvertType<TReturn extends SupportTypes> = {
  readonly name: string;
  readonly converter: (source: string) => TReturn | undefined;
};

export type ConvertParameter<TReturn extends SupportTypes> = {
  readonly name: string;
  readonly description: string;
  readonly value: string;
  readonly convertType: ConvertType<TReturn>;
};

export function convertParameter<TReturn extends SupportTypes>(parameter: ConvertParameter<TReturn>): TReturn {
  const result = parameter.convertType.converter(parameter.value);
  if (!result) throw new InvalidFormatError(parameter);
  return result;
}

/*
function convertArguments<TParameterTypes extends ParameterTypes, TFormat extends CommandFormat<TParameterTypes>>(
  interpretation: CommandInterpretation<TParameterTypes, TFormat>["arguments"],
  format: TFormat["arguments"],
  types: TParameterTypes
): CommandParseResult<TParameterTypes, TFormat>["arguments"] {
  const params = [];
  let index = 0;
  for (const type of format) {
    if (!type) break;
    try {
      const param = convertParameter(interpretation[index], type);
      params.push(param);
    } catch (error) {
      if (error instanceof InternalInvalidFormatError) {
        throw error.getCompleteError({ argumentIndex: index });
      }
      throw error;
    }
    ++index;
  }
  return [...params] as CommandParseResult<TParameterTypes, TFormat>["arguments"];
}

function convertOptions<TParameterTypes extends ParameterTypes, TFormat extends CommandFormat<TParameterTypes>>(
  interpretation: CommandInterpretation<TParameterTypes, TFormat>["options"],
  format: TFormat["options"],
  types: TParameterTypes
): CommandParseResult<TParameterTypes, TFormat>["options"] {
  const initOptions: { [key: string]: string | number } = {};
  const options = Object.keys(format);
  return options.reduce((prev, name) => {
    try {
      const paramString = interpretation[name];
      if (!paramString) return prev;
      prev[name] = convertParameter(paramString, types[format[name]]);
      return prev;
    } catch (error) {
      if (error instanceof InternalInvalidFormatError) {
        throw error.getCompleteError({ optionName: name });
      }
      throw error;
    }
  }, initOptions) as CommandParseResult<TParameterTypes, TFormat>["options"];
}

export function convertCommandParameters<
  TParameterTypes extends ParameterTypes,
  TFormat extends CommandFormat<TParameterTypes>
>(
  interpretation: Pick<CommandInterpretation<TParameterTypes, TFormat>, "arguments" | "options">,
  format: TFormat,
  types: TParameterTypes
): Pick<CommandParseResult<TParameterTypes, TFormat>, "arguments" | "options"> {
  return {
    arguments: convertArguments(interpretation.arguments, format.arguments, types),
    options: convertOptions(interpretation.options, format.options, types)
  };
}
*/
