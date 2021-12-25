import { parseCommand } from "./command-parser";

const types = {
  integer: {
    name: "整数",
    converter: (value: string) => {
      const num = parseInt(value);
      if (isNaN(num)) return;
      return num;
    }
  },

  float: {
    name: "実数",
    converter: (value: string) => {
      const num = parseFloat(value);
      if (isNaN(num)) return;
      return num;
    }
  },

  string: {
    name: "文字列",
    converter: (value: string) => {
      return value;
    }
  }
} as const;

const format = {
  prefixes: ["/search-message", "/message search"],
  arguments: [
    {
      name: "テスト文字列（引数1）",
      type: "string"
    },
    {
      name: "テスト実数（引数2）",
      type: "float"
    },
    {
      name: "テスト整数（引数3）",
      type: "integer"
    }
  ],
  options: {
    content: {
      name: "テスト文字列（オプション）",
      type: "string"
    },
    page: {
      name: "テスト整数（オプション）",
      type: "integer"
    }
  }
} as const;

const commands = [
  "/search-message aaaaa 11.1 100 --content alpha --page 3",
  "/message search bbbbb 22.2 200",
  "/search-message ccccc 33.3 300 --content gamma",
  "/create-message ddddd 44.4 400 --content gamma",
  "/search-message ddddd 55.5 3.14159 --content gamma",
  "/search-message eeeee 66.6 600 1209 --content gamma",
  "/search-message fffff 77.7 --content gamma",
  "/search-message ggggg 88.8 800 --content gamma --animal dog",
  "/search-message iiiii mmmmm 900 --content gamma",
  "/search-message 111 99.9 1000 --page hoge"
];

function showCommand(command: string) {
  const result = parseCommand(command, format, types);
  console.log(result);

  if (!result) return;

  // Return types
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const prefix: string = result.prefix;
  const argument1: string = result.arguments[0];
  const argument2: number = result.arguments[1];
  const argument3: number = result.arguments[2];
  const contentOption: string | undefined = result.options.content;
  const pageOption: number | undefined = result.options.page;
}

for (const command of commands) {
  console.log(command);
  try {
    showCommand(command);
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.log("unknown error");
    }
  }
  console.log();
}
