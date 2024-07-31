import React, { ChangeEvent, MouseEvent } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";

import styles from "./Main.module.css";

interface FIELD {
  NAME: string;
}

type FormValues = {
  [key: string]: string;
};
const FIELDS: FIELD = {
  NAME: "name",
};

const Main = () => {
  const { NAME } = FIELDS;

  const [values, setValues] = useState<FormValues>({});

  const handleChange = ({
    target: { value, name },
  }: ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [name]: value });
  };

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    const isDisabled = Object.values(values).some((v) => !v);

    if (isDisabled) e.preventDefault();
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.container}>
        <h1 className={styles.heading}>Join</h1>

        <form className={styles.form}>
          <div className={styles.group}>
            <input
              type="text"
              name="name"
              value={values[NAME]}
              placeholder="Username"
              className={styles.input}
              onChange={handleChange}
              autoComplete="off"
              required
            />
          </div>

          <Link
            className={styles.group}
            onClick={handleClick}
            to={`/myaccount?name=${values[NAME]}`}
          >
            <button type="submit" className={styles.button}>
              Sign In
            </button>
          </Link>
        </form>
      </div>
    </div>
  );
};

export default Main;
