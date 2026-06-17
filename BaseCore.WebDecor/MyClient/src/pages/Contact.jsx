import React, { useState } from 'react';

const Contact = () => {
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [sent, setSent] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Ở đây có thể gửi email qua backend nếu có API
        setSent(true);
        setForm({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setSent(false), 5001);
    };

    return (
        <div className="container mt-4">
            <h2>Contact Us</h2>
            {sent && <div className="alert alert-success">Thank you for your message!</div>}
            <div className="row">
                <div className="col-md-6">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label>Name</label>
                            <input type="text" name="name" className="form-control" value={form.name} onChange={handleChange} required />
                        </div>
                        <div className="mb-3">
                            <label>Email</label>
                            <input type="email" name="email" className="form-control" value={form.email} onChange={handleChange} required />
                        </div>
                        <div className="mb-3">
                            <label>Subject</label>
                            <input type="text" name="subject" className="form-control" value={form.subject} onChange={handleChange} required />
                        </div>
                        <div className="mb-3">
                            <label>Message</label>
                            <textarea name="message" className="form-control" rows="5" value={form.message} onChange={handleChange} required />
                        </div>
                        <button type="submit" className="btn btn-primary">Send</button>
                    </form>
                </div>
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body">
                            <h5>Our Office</h5>
                            <p>123 Main Street, Hanoi, Vietnam</p>
                            <p>Email: support@multishop.com</p>
                            <p>Phone: +84 123 456 789</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;