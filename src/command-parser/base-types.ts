import { SupportTypes } from "./converter";
import { ConvertTypeSetBase } from "./parser";

type Parameter<TConvertTypeSet extends ConvertTypeSetBase = ConvertTypeSetBase> = {
  readonly name: string;
  readonly description: string;
  readonly type: keyof TConvertTypeSet;
};

export type CommandFormatArguments<TConvertTypeSet extends ConvertTypeSetBase> =
  | readonly []
  | readonly [Parameter<TConvertTypeSet>]
  | readonly [Parameter<TConvertTypeSet>, Parameter<TConvertTypeSet>]
  | readonly [Parameter<TConvertTypeSet>, Parameter<TConvertTypeSet>, Parameter<TConvertTypeSet>]
  | readonly [
      Parameter<TConvertTypeSet>,
      Parameter<TConvertTypeSet>,
      Parameter<TConvertTypeSet>,
      Parameter<TConvertTypeSet>
    ]
  | readonly [
      Parameter<TConvertTypeSet>,
      Parameter<TConvertTypeSet>,
      Parameter<TConvertTypeSet>,
      Parameter<TConvertTypeSet>,
      Parameter<TConvertTypeSet>
    ];

export type CommandFormatOptions<TConvertTypeSet extends ConvertTypeSetBase> = {
  readonly [key: string]: Parameter<TConvertTypeSet>;
};
