import React, { useState } from "react";
import { authService } from "../api/auth";
const Login = ({ onNavigate }) => {
    const [email, setEmail] = useState('scott@gmail.com');
    const [password, setPassword] = useState('111111');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await authService.login(email, password);
            console.log('Giriş Başarılı:', data);

            alert('Giriş başarılı!');
            // Buranın kesinlikle 'dashboard' olduğundan emin oluyoruz
            onNavigate('dashboard');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Giriş yapılırken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id="wrapper" className="wrapper">
            <div className="row container-min-full-height">

                {/* SOLDAKİ FORM ALANI */}
                <div className="col-lg-8 p-3 login-left">
                    <div className="w-50">
                        <h2 className="mb-4 text-center">Welcome back!</h2>

                        {error && <div className="alert alert-danger text-center">{error}</div>}

                        <form className="text-center" onSubmit={handleLogin}>
                            <div className="form-group">
                                <label className="text-muted" htmlFor="example-email">Email</label>
                                <input
                                    type="email"
                                    placeholder="johndoe@site.com"
                                    className="form-control form-control-line"
                                    name="example-email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="text-muted" htmlFor="example-password">Password</label>
                                <input
                                    type="password"
                                    placeholder="password"
                                    className="form-control form-control-line"
                                    name="example-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group no-gutters mb-5 text-center">
                                <a href="#forgot" id="to-recover" className="text-muted fw-700 text-uppercase heading-font-family fs-12">Forgot Password?</a>
                            </div>
                            <div className="form-group mr-b-20">
                                <button
                                    className="btn btn-block btn-rounded btn-md btn-color-scheme text-uppercase fw-600 ripple"
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? 'Signing In...' : 'Sign In'}
                                </button>
                            </div>
                        </form>
                        <button type="button" className="btn btn-block btn-rounded btn-outline-facebook ripple" title="Login with Facebook">
                            Connect using <span className="fw-700">facebook</span>
                        </button>
                    </div>
                </div>

                {/* SAĞDAKİ MOR EKRAN */}
                <div className="col-lg-4 login-right d-lg-flex d-none pos-fixed pos-right text-inverse container-min-full-height" style={{ backgroundImage: "url('/assets/demo/login-page-bg.jpg')" }}>
                    <div className="login-content px-3 w-75 text-center">
                        <h2 className="mb-4 text-center fw-300">New here?</h2>
                        <p className="heading-font-family fw-300 letter-spacing-minus">Sign up and discover the many great features that our app provides</p>
                        <button type="button" onClick={() => onNavigate('register')} className="btn btn-rounded btn-md btn-outline-inverse text-uppercase fw-600 ripple pd-lr-60 mr-t-200">
                            Sign Up
                        </button>
                        <ul className="list-inline mt-4 heading-font-family text-uppercase fs-13 mr-t-20">
                            <li className="list-inline-item"><a href="#">Home</a></li>
                            <li className="list-inline-item"><a href="#">About</a></li>
                            <li className="list-inline-item"><a href="#">Contact</a></li>
                            <li className="list-inline-item"><a href="#">Careers</a></li>
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Login;