import React, { InputHTMLAttributes } from 'react'
import { useField } from "formik";
import { Input, FormControl, FormLabel, FormErrorMessage, Textarea } from '@chakra-ui/react';

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  textArea?: boolean;
};

export const InputField: React.FC<InputFieldProps> = ({
  textArea,
  label,
  size,
  ...props
  }) => {
  let InputOrTextarea = Input
  if (textArea) { InputOrTextarea = Textarea as any }
  const [field, { error }] = useField(props);
  return (
    <FormControl mb={3} isInvalid={!!error}>
      <FormLabel htmlFor={field.name}>{label}</FormLabel>
      <InputOrTextarea {...field} {...props} id={field.name} placeholder={props.placeholder} />
      {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
    </FormControl>
  );
};