import styles from "./Input.module.css";
import { InputProps } from "./Input.props";
import cn from "classnames";

function Input({ children, className, ...props }: InputProps) {
	return (
		<input className={cn(styles['input'], className)} {...props}
		/>
			
		
	);
}
export default Input;
