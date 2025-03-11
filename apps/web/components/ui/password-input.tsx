'use client';

import { EyeOffIcon, EyeIcon } from 'lucide-react';
import { useState } from 'react';
import { FieldValues } from 'react-hook-form';
import { Input } from '../ui/input';

interface PasswordInputProps {
  field: FieldValues;
  disabled?: boolean;
}

const PasswordInput = ({ field, disabled }: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        {...field}
        type={showPassword ? 'text' : 'password'}
        placeholder={showPassword ? 'Enter Password' : '*********'}
        className="form-input"
        disabled={disabled}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute inset-y-0 right-2 px-1  flex items-center text-muted-foreground "
      >
        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
};

export default PasswordInput;
