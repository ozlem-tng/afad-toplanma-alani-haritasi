import React, { useState } from "react";
import { authService } from "../api/auth";
const Register = ({ onNavigate }) => {
    const [email, setEmail] = useState('scott@gmail.com');
    const [name, setName] = useState('Scott Adams');
    const [password, setPassword] = useState('111111');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        setLoading(true);

        try {
            await authService.register(email, password);
            setSuccess(true);
            alert('Kayıt başarılı! Yönlendiriliyorsunuz.');
            setTimeout(() => {
                onNavigate('dashboard');
            }, 1000);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Kayıt esnasında bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id="wrapper" className="wrapper">
            <div className="row container-min-full-height">

                {/* SOLDAKİ FORM ALANI */}
                <div className="col-lg-8 p-3 login-left text-inverse" style={{ backgroundImage: "url('/assets/demo/login-page-bg.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    <div className="w-50">
                        <h2 className="mb-4 text-center text-white">Sign up now!</h2>

                        {error && <div className="alert alert-danger text-center">{error}</div>}
                        {success && <div className="alert alert-success text-center">Registration successful!</div>}

                        <form className="text-center" onSubmit={handleRegister}>
                            <div className="form-group">
                                <label className="text-white" htmlFor="example-email">Email</label>
                                <input
                                    type="email"
                                    placeholder="johndoe@site.com"
                                    className="form-control form-control-line text-white"
                                    name="example-email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{ color: '#ffffff' }}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="text-white" htmlFor="example-name">Name</label>
                                <input
                                    type="text"
                                    placeholder="johndoe@site.com"
                                    className="form-control form-control-line text-white"
                                    name="example-name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    style={{ color: '#ffffff' }}
                                />
                            </div>
                            <div className="form-group">
                                <label className="text-white" htmlFor="example-password">Password</label>
                                <input
                                    type="password"
                                    placeholder="password"
                                    className="form-control form-control-line text-white"
                                    name="example-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{ color: '#ffffff' }}
                                    required
                                />
                            </div>
                            <div className="form-group mr-b-20">
                                <button
                                    className="btn btn-block btn-rounded btn-md btn-color-scheme text-uppercase fw-600 ripple"
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? 'Signing Up...' : 'Sign Up'}
                                </button>
                            </div>
                        </form>
                        <button type="button" className="btn btn-block btn-rounded btn-outline-facebook ripple" title="Login with Facebook">
                            Connect using <span className="fw-700">facebook</span>
                        </button>
                    </div>
                </div>

                {/* SAĞDAKİ PANEL */}
                <div className="col-lg-4 login-right d-lg-flex d-none pos-fixed pos-right text-dark container-min-full-height" style={{ backgroundColor: '#ffffff', backgroundImage: 'none' }}>
                    <div className="login-content px-3 w-75 text-center">
                        <h2 className="mb-4 text-center fw-300 text-dark">Already Registered?</h2>
                        <p className="heading-font-family fw-300 letter-spacing-minus text-muted">Login and continue your web experience using your favourite app</p>
                        <button type="button" onClick={() => onNavigate('login')} className="btn btn-rounded btn-md btn-color-scheme text-uppercase fw-600 ripple pd-lr-60 mr-t-200">
                            Sign In
                        </button>
                        <ul className="list-inline mt-4 heading-font-family text-uppercase fs-13 mr-t-20">
                            <li className="list-inline-item"><a href="#" className="text-muted">Home</a></li>
                            <li className="list-inline-item"><a href="#" className="text-muted">About</a></li>
                            <li className="list-inline-item"><a href="#" className="text-muted">Contact</a></li>
                            <li className="list-inline-item"><a href="#" className="text-muted">Careers</a></li>
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Register;