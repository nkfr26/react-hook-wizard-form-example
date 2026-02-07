export function Input(props: React.ComponentProps<"input">) {
  return (
    <input
      {...props}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
        }
        props.onKeyDown?.(e);
      }}
    />
  );
}
