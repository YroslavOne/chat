import styles from "./Button.module.css";
import { ButtonProps } from "./Button.props";
import cn from "classnames";

function Button({
  children,
  className,
  view = "close",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(styles["button"], className, {
        [styles["close"]]: view === "close",
        [styles["send"]]: view === "send",
      })}
      {...props}
    >
      {children}
    </button>
  );
}
export default Button;
