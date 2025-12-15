import { FC, memo } from "react";
import ReactMarkdown, { Options, Components } from "react-markdown";

interface CustomComponents extends Components {
  error?: React.ComponentType<any>;
  graph?: React.ComponentType<any>;
  cusomized?: React.ComponentType<any>;
  code?: React.ComponentType<any>;
  img?: React.ComponentType<any>;
}

interface CustomOptions extends Options {
  components?: CustomComponents;
}

const MemoizedReactMarkdown: FC<CustomOptions> = memo(
  ReactMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children
);

export default MemoizedReactMarkdown;
