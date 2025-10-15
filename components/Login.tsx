import React, { useState } from 'react';
import Button from './common/Button';
import Input from './common/Input';
import WineGlassIcon from './icons/WineGlassIcon';
import Modal from './common/Modal';
import { User, UserRole } from '../types';

interface LoginProps {
  onLogin: (email: string, password: string) => boolean;
  onRegister: (user: Omit<User, 'id'>) => boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin, onRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);

  const initialRegisterState = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: UserRole.Almacen,
  };

  const [registerFormState, setRegisterFormState] = useState(initialRegisterState);
  const [registerError, setRegisterError] = useState('');


  const validatePassword = (password: string): string | null => {
    const errors: string[] = [];
    if (password.length < 8) {
        errors.push("al menos 8 caracteres");
    }
    if (!/[A-Z]/.test(password)) {
        errors.push("una letra mayúscula");
    }
    if (!/[a-z]/.test(password)) {
        errors.push("una letra minúscula");
    }
    if (!/[0-9]/.test(password)) {
        errors.push("un número");
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password)) {
        errors.push("un carácter especial");
    }

    if (errors.length > 0) {
        return `La contraseña es inválida. Debe contener: ${errors.join(', ')}.`;
    }

    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const passwordError = validatePassword(password);
    if (passwordError) {
        setError(passwordError);
        return;
    }

    const success = onLogin(email, password);
    if (!success) {
      setError('Credenciales inválidas. Inténtelo de nuevo.');
    }
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterFormState(prev => ({...prev, [name]: value}));
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');

    if (registerFormState.password !== registerFormState.confirmPassword) {
      setRegisterError('Las contraseñas no coinciden.');
      return;
    }
    
    const passwordError = validatePassword(registerFormState.password);
    if (passwordError) {
      setRegisterError(passwordError);
      return;
    }

    const success = onRegister({
      name: registerFormState.name,
      email: registerFormState.email,
      password: registerFormState.password,
      role: registerFormState.role,
    });
    
    if (success) {
      setIsRegisterModalOpen(false);
      setRegisterFormState(initialRegisterState);
    }
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setForgotPasswordSuccess(true);
  }

  const handleCloseForgotModal = () => {
    setIsForgotModalOpen(false);
    setTimeout(() => {
        setForgotPasswordEmail('');
        setForgotPasswordSuccess(false);
    }, 300);
  }


  return (
    <>
      <div className="min-h-screen bg-dark flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center text-primary">
            <WineGlassIcon className="h-12 w-auto" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Mi Solución en Vinos
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            Inicia sesión en tu cuenta
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <Input
                id="email"
                label="Correo Electrónico"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <Input
                id="password"
                label="Contraseña"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />

              {error && <p className="text-sm text-red-600">{error}</p>}
              
              <div className="text-sm text-right">
                  <a href="#" onClick={(e) => { e.preventDefault(); setIsForgotModalOpen(true); }} className="font-medium text-dark-gray hover:text-primary">
                      ¿Olvidaste tu contraseña?
                  </a>
              </div>

              <div className="flex flex-col sm:flex-row-reverse items-center gap-3">
                <Button type="submit" className="w-full">
                  Iniciar Sesión
                </Button>
                <Button type="button" variant="secondary" className="w-full" onClick={() => setIsRegisterModalOpen(true)}>
                  Registrarse
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <Modal isOpen={isRegisterModalOpen} onClose={() => setIsRegisterModalOpen(false)} title="Crear Nueva Cuenta">
          <form className="space-y-6" onSubmit={handleRegisterSubmit}>
              <Input
                  id="register-name"
                  name="name"
                  label="Nombre Completo"
                  type="text"
                  value={registerFormState.name}
                  onChange={handleRegisterChange}
                  required
              />
              <Input
                  id="register-email"
                  name="email"
                  label="Correo Electrónico"
                  type="email"
                  value={registerFormState.email}
                  onChange={handleRegisterChange}
                  required
              />
              <Input
                  id="register-password"
                  name="password"
                  label="Contraseña"
                  type="password"
                  value={registerFormState.password}
                  onChange={handleRegisterChange}
                  required
              />
              <Input
                  id="register-confirmPassword"
                  name="confirmPassword"
                  label="Confirmar Contraseña"
                  type="password"
                  value={registerFormState.confirmPassword}
                  onChange={handleRegisterChange}
                  required
              />
              {registerError && <p className="text-sm text-red-600">{registerError}</p>}
              <div className="pt-2 flex justify-end gap-3">
                  <Button type="button" variant="secondary" onClick={() => setIsRegisterModalOpen(false)}>Cancelar</Button>
                  <Button type="submit">Registrarse</Button>
              </div>
          </form>
      </Modal>

      <Modal isOpen={isForgotModalOpen} onClose={handleCloseForgotModal} title="Restablecer Contraseña">
          {forgotPasswordSuccess ? (
              <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900">Correo Enviado</h3>
                  <p className="mt-2 text-sm text-gray-500">
                      Si existe una cuenta asociada a <strong>{forgotPasswordEmail}</strong>, hemos enviado un enlace para restablecer tu contraseña.
                  </p>
                  <div className="mt-4">
                      <Button onClick={handleCloseForgotModal}>Cerrar</Button>
                  </div>
              </div>
          ) : (
              <form className="space-y-6" onSubmit={handleForgotPasswordSubmit}>
                  <p className="text-sm text-gray-600">
                      Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                  </p>
                  <Input
                      id="forgot-email"
                      label="Correo Electrónico"
                      type="email"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      required
                      autoComplete="email"
                  />
                  <div className="pt-2 flex justify-end gap-3">
                      <Button type="button" variant="secondary" onClick={handleCloseForgotModal}>Cancelar</Button>
                      <Button type="submit">Enviar Enlace</Button>
                  </div>
              </form>
          )}
      </Modal>
    </>
  );
};

export default Login;