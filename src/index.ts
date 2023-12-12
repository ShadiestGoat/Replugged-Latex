import { Injector, common } from "replugged";
import katex from "katex";
import "katex/dist/katex.min.css";
import { Parser as htmlParserFactory } from "html-to-react";
import { ParserRule, ReactOutputRule } from "simple-markdown";

const { parser } = common;

const inject = new Injector();

export function start(): void {
  const htmlParser = htmlParserFactory({});

  (parser.defaultRules as Record<string, ParserRule & ReactOutputRule>).latex = {
    order: 23,
    match(source) {
      let reg = /^\$(.+?)\$/;
      if (source.startsWith("$$")) {
        reg = /^\$\$(.+?)\$\$/s;
      }

      return reg.exec(source);
    },
    parse(capture) {
      const content = capture[0];
      let size = 1;
      if (content.startsWith("$$")) {
        size = 2;
      }

      return {
        content: capture[0].slice(size, -size),
        type: `latex`,
        inline: size == 1,
      };
    },
    react(node) {
      const html = katex.renderToString(node.content, {
        output: "html",
        displayMode: !node.inline,
        throwOnError: false,
      });

      return htmlParser.parse(html);
    },
  };

  parser.parse = parser.reactParserFor(parser.defaultRules);
}

export function stop(): void {
  inject.uninjectAll();

  delete (parser.defaultRules as Record<string, ParserRule & ReactOutputRule>).latex;
  parser.parse = parser.reactParserFor(parser.defaultRules);
}
