import Link from "next/link";
import React from "react";
import CodeBlock from "../atoms/code-block";
import GenericTable from "../atoms/generic-table";

// Define common types for markdown component props
type MarkdownComponentProps = {
    node?: any;
    className?: string;
    children?: React.ReactNode;
    [key: string]: any;
};

// Helper function to safely convert React elements to renderable content
const getRenderedContent = (content: React.ReactNode): React.ReactNode => {
    if (React.isValidElement(content)) {
        // If it's a React element, return it as is
        return content;
    } else if (Array.isArray(content)) {
        // If it's an array, map through and process each item
        return content.map((item, index) => (
            <React.Fragment key={index}>{getRenderedContent(item)}</React.Fragment>
        ));
    } else if (typeof content === "object" && content !== null) {
        // If it's an object but not a React element, convert to string to avoid [object Object]
        return JSON.stringify(content);
    }
    // Otherwise return as is
    return content;
};

// Extract the markdown components to prevent recreation on each render
export const markdownComponents = {
    table({ node, children, ...props }: MarkdownComponentProps) {
        const headers = React.Children.toArray(children)
            .filter((child: any) => child.type === "thead")
            .flatMap((thead: any) =>
                React.Children.toArray(thead.props.children).flatMap((tr: any) =>
                    React.Children.toArray(tr.props.children).map((th: any) => ({
                        header: th.props.children,
                        accessorKey: th.props.children.toString(),
                        cell: (info: any) => getRenderedContent(info.getValue()),
                    }))
                )
            );

        const rows = React.Children.toArray(children)
            .filter((child: any) => child.type === "tbody")
            .flatMap((tbody: any) =>
                React.Children.toArray(tbody.props.children).map((tr: any) => {
                    const rowData: Record<string, any> = {};
                    React.Children.toArray(tr.props.children).forEach(
                        (td: any, index: number) => {
                            if (headers[index]) {
                                rowData[headers[index].accessorKey] = td.props.children;
                            }
                        }
                    );
                    return rowData;
                })
            );

        if (!headers.length || !rows.length) {
            return (
                <div className='my-4 overflow-x-auto'>
                    <table
                        className='min-w-full border-collapse border border-gray-300 dark:border-gray-700'
                        {...props}
                    >
                        {children}
                    </table>
                </div>
            );
        }

        return (
            <div className='my-4 w-full'>
                <GenericTable columns={headers} data={rows} />
            </div>
        );
    },

    code({ node, className, children, ...props }: MarkdownComponentProps) {
        // @ts-ignore
        const content = children?.[0] || "";

        if (content.trim() === "▍") {
            return (
                <span className='mt-1 cursor-default animate-pulse text-textPrimaryLight dark:text-textPrimaryDark'>
                    ▍
                </span>
            );
        }

        const match = /language-(\w+)/.exec(className || "");

        if (!(match && match[1])) {
            return <>{String(children)}</>;
        }

        return (
            <div className='my-4 max-w-[700px] overflow-x-scroll'>
                <CodeBlock
                    key={Math.random()}
                    language={(match && match[1]) || ""}
                    value={String(children).replace(/\n$/, "")}
                    {...props}
                />
            </div>
        );
    },
    img({
        node,
        src,
        alt,
        width,
        height,
        ...props
    }: MarkdownComponentProps & {
        src?: string;
        alt?: string;
        width?: number | string;
        height?: number | string;
    }) {
        return (
            <img
                src={src || ""}
                alt={alt || ""}
                width={typeof width === "number" ? width : parseInt(width || "300", 10)}
                height={
                    typeof height === "number" ? height : parseInt(height || "300", 10)
                }
                className='rounded-sm w-auto h-auto'
                loading='lazy'
                {...props}
            />
        );
    },
    a({
        node,
        href,
        children,
        ...props
    }: MarkdownComponentProps & { href?: string }) {
        return (
            <Link
                href={href || "#"}
                className='text-blue-500 hover:underline'
                target='_blank'
                rel='noopener noreferrer'
                {...props}
            >
                {children}
            </Link>
        );
    },
    blockquote({ node, children, ...props }: MarkdownComponentProps) {
        return (
            <blockquote
                className='font-poppins border-l-4 border-gray-300 pl-4 italic text-gray-600'
                {...props}
            >
                {children}
            </blockquote>
        );
    },
    ol({ node, children, ...props }: MarkdownComponentProps) {
        return (
            <ol className='list-decimal list-outside ml-2' {...props}>
                {children}
            </ol>
        );
    },
    li({ node, children, ...props }: MarkdownComponentProps) {
        return (
            <li className='py-1' {...props}>
                {children}
            </li>
        );
    },
    ul({ node, children, ...props }: MarkdownComponentProps) {
        return (
            <ul className='list-disc list-outside ml-2' {...props}>
                {children}
            </ul>
        );
    },
    strong({ node, children, ...props }: MarkdownComponentProps) {
        return (
            <span className='font-semibold' {...props}>
                {children}
            </span>
        );
    },
    h1({ node, children, ...props }: MarkdownComponentProps) {
        return (
            <h1 className='text-3xl font-semibold my-2' {...props}>
                {children}
            </h1>
        );
    },
    h2({ node, children, ...props }: MarkdownComponentProps) {
        return (
            <h2 className='text-2xl font-semibold my-2' {...props}>
                {children}
            </h2>
        );
    },
    h3({ node, children, ...props }: MarkdownComponentProps) {
        return (
            <h3 className='text-xl font-semibold my-2' {...props}>
                {children}
            </h3>
        );
    },
    h4({ node, children, ...props }: MarkdownComponentProps) {
        return (
            <h4 className='text-lg font-semibold my-2' {...props}>
                {children}
            </h4>
        );
    },
    h5({ node, children, ...props }: MarkdownComponentProps) {
        return (
            <h5 className='text-base font-semibold my-2' {...props}>
                {children}
            </h5>
        );
    },
    h6({ node, children, ...props }: MarkdownComponentProps) {
        return (
            <h6 className='text-sm font-semibold my-2' {...props}>
                {children}
            </h6>
        );
    },
    p({ node, children, ...props }: MarkdownComponentProps) {
        return (
            <p className='text-base my-2' {...props}>
                {children}
            </p>
        );
    },
    hr({ node, ...props }: MarkdownComponentProps) {
        return <hr className='my-2' {...props} />;
    },
};
