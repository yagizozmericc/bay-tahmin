import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';
import { registerWithEmail } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

const mapAuthError = (error) => {
  const code = error?.code;

  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    default:
      return error?.message || 'Unable to create an account. Please try again later.';
  }
};

const RegisterPage = () => {
  const { register, handleSubmit, watch, formState, setError } = useForm({
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });
  const { errors, isSubmitting } = formState;
  const [authError, setAuthError] = useState('');
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const passwordValue = watch('password');

  const onSubmit = async (values) => {
    setAuthError('');

    if (values.password !== values.confirmPassword) {
      const message = 'Passwords do not match.';
      setError('confirmPassword', { type: 'manual', message });
      return;
    }

    try {
      await registerWithEmail({
        email: values.email.trim(),
        password: values.password,
        displayName: values.displayName.trim()
      });
      const redirectPath = location.state?.from?.pathname || '/user-dashboard';
      navigate(redirectPath, { replace: true });
    } catch (error) {
      const message = mapAuthError(error);
      setAuthError(message);
      setError('email', { type: 'manual', message });
    }
  };

  if (!loading && isAuthenticated) {
    const redirectPath = location.state?.from?.pathname || '/user-dashboard';
    return <Navigate to={redirectPath} replace />; 
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-card border border-border rounded-2xl shadow-elevation-2 p-8">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground mx-auto">
            <Icon name="UserPlus" size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Create your account</h1>
            <p className="text-sm text-muted-foreground">Join the community and start predicting matches.</p>
          </div>
        </div>

        {authError && (
          <div className="p-3 rounded-md border border-destructive/40 bg-destructive/10 text-destructive text-sm">
            {authError}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Display Name"
            type="text"
            autoComplete="name"
            {...register('displayName', {
              required: 'Display name is required.',
              minLength: {
                value: 2,
                message: 'Display name should be at least 2 characters.'
              }
            })}
            error={errors.displayName?.message}
          />

          <Input
            label="Email"
            type="email"
            autoComplete="email"
            required
            {...register('email', {
              required: 'Email is required.',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Please enter a valid email address.'
              }
            })}
            error={errors.email?.message}
          />

          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            required
            {...register('password', {
              required: 'Password is required.',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters.'
              }
            })}
            error={errors.password?.message}
          />

          <Input
            label="Confirm Password"
            type="password"
            autoComplete="new-password"
            required
            {...register('confirmPassword', {
              required: 'Please confirm your password.',
              validate: (value) => value === passwordValue || 'Passwords do not match.'
            })}
            error={errors.confirmPassword?.message}
          />

          <Button type="submit" className="w-full" loading={isSubmitting}>
            Create Account
          </Button>
        </form>

        <div className="text-sm text-muted-foreground text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
