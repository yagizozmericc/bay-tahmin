import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';
import { loginWithEmail } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

const mapAuthError = (error) => {
  const code = error?.code;

  switch (code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Incorrect email or password. Please try again.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please wait a moment and try again.';
    default:
      return error?.message || 'Unable to sign in. Please try again later.';
  }
};

const LoginPage = () => {
  const { register, handleSubmit, formState, setError, watch } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });
  const { errors, isSubmitting } = formState;
  const [authError, setAuthError] = useState('');
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const onSubmit = async (values) => {
    setAuthError('');

    try {
      await loginWithEmail({ email: values.email.trim(), password: values.password });
      const redirectPath = location.state?.from?.pathname || '/user-dashboard';
      navigate(redirectPath, { replace: true });
    } catch (error) {
      const message = mapAuthError(error);
      setAuthError(message);
      setError('password', { type: 'manual', message });
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
            <Icon name="LogIn" size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Sign in to manage your leagues and predictions.</p>
          </div>
        </div>

        {authError && (
          <div className="p-3 rounded-md border border-destructive/40 bg-destructive/10 text-destructive text-sm">
            {authError}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
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
            autoComplete="current-password"
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

          <Button type="submit" className="w-full" loading={isSubmitting}>
            Sign In
          </Button>
        </form>

        <div className="text-sm text-muted-foreground text-center">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary hover:underline font-medium">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
