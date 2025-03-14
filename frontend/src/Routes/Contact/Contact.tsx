import React, { useState } from 'react'
import emailjs from 'emailjs-com'
import './Contact.scss'

type Props = {}

export default function Contact({ }: Props) {
  const emailTemplate = `
  `

  const [formData, setFormData] = useState({
    subject: 'Thank You for Contacting Demi',
    name: '',
    email: '',
    message: '',
    first_line: 'Dear {{name}},',
    second_line: 'Thank you for reaching out to us. We have received your message and will get back to you as soon as possible.',
    last_line: 'Best regards, Demi Team',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Send first email (original template)
    const firstEmail = emailjs.send(
      process.env.REACT_APP_EMAILJS_SERVICE_ID!,
      process.env.REACT_APP_EMAILJS_TEMPLATE_ID!,
      formData,
      process.env.REACT_APP_EMAILJS_USER_ID!
    );

    // Send second email (auto-reply template)
    const secondEmail = emailjs.send(
      process.env.REACT_APP_EMAILJS_SERVICE_ID!,
      'template_rzeeiid',
      {
        subject: formData.subject,
        to_email: formData.email,
        name: formData.name,
        first_line: formData.first_line.replace('{{name}}', formData.name),
        second_line: formData.second_line,
        last_line: formData.last_line,
      },
      process.env.REACT_APP_EMAILJS_USER_ID!
    );

    // Handle both promises
    Promise.all([firstEmail, secondEmail])
      .then(([result1, result2]) => {
        console.log('First email:', result1.text);
        console.log('Second email:', result2.text);
        window.location.href = '/contact/sent?success=true';
      })
      .catch((error) => {
        console.log('Error:', error);
        window.location.href = '/contact/sent?success=false';
      });
  };

  return (
    <div className="container">
      <h1>Contact Us</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div>
          <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div>
          <label>Message</label>
          <textarea name="message" value={formData.message} onChange={handleChange} required />
        </div>
        <button type="submit">Send</button>
      </form>
    </div>
  );
}