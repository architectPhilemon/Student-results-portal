const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  if (process.env.NODE_ENV === 'production') {
    // Production email configuration
    return nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT == 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  } else {
    // Development - use Ethereal Email for testing
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass'
      }
    });
  }
};

// Send email function
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `${process.env.FROM_NAME || 'EduPortal'} <${process.env.FROM_EMAIL || 'noreply@eduportal.com'}>`,
      to: options.email,
      subject: options.subject,
      html: options.html || options.message,
      text: options.text
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent:', info.messageId);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }

    return info;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

// Email templates
const emailTemplates = {
  welcome: (user) => ({
    subject: 'Welcome to EduPortal!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4f46e5;">Welcome to EduPortal!</h1>
        <p>Hello ${user.firstName} ${user.lastName},</p>
        <p>Welcome to EduPortal! Your account has been successfully created.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Account Details:</h3>
          <p><strong>Name:</strong> ${user.firstName} ${user.lastName}</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Role:</strong> ${user.role}</p>
          <p><strong>Department:</strong> ${user.department}</p>
          ${user.studentId ? `<p><strong>Student ID:</strong> ${user.studentId}</p>` : ''}
          ${user.employeeId ? `<p><strong>Employee ID:</strong> ${user.employeeId}</p>` : ''}
        </div>
        <p>You can now log in to your account and start exploring the platform.</p>
        <a href="${process.env.FRONTEND_URL}/login" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Login to EduPortal</a>
        <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
          If you have any questions, please contact our support team.
        </p>
      </div>
    `
  }),

  assignmentCreated: (assignment, course) => ({
    subject: `New Assignment: ${assignment.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4f46e5;">New Assignment Posted</h1>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>${assignment.title}</h3>
          <p><strong>Course:</strong> ${course.courseCode} - ${course.title}</p>
          <p><strong>Type:</strong> ${assignment.type}</p>
          <p><strong>Due Date:</strong> ${new Date(assignment.dueDate).toLocaleDateString()}</p>
          <p><strong>Points:</strong> ${assignment.totalPoints}</p>
        </div>
        <p><strong>Description:</strong></p>
        <p>${assignment.description}</p>
        <a href="${process.env.FRONTEND_URL}/assignments/${assignment._id}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Assignment</a>
      </div>
    `
  }),

  gradePosted: (grade, assignment, course) => ({
    subject: `Grade Posted: ${assignment.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4f46e5;">Grade Posted</h1>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>${assignment.title}</h3>
          <p><strong>Course:</strong> ${course.courseCode} - ${course.title}</p>
          <p><strong>Grade:</strong> ${grade.points}/${grade.totalPoints} (${grade.percentage}%)</p>
          <p><strong>Letter Grade:</strong> ${grade.letterGrade}</p>
        </div>
        ${grade.feedback ? `<p><strong>Feedback:</strong></p><p>${grade.feedback}</p>` : ''}
        <a href="${process.env.FRONTEND_URL}/grades" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View All Grades</a>
      </div>
    `
  }),

  announcementCreated: (announcement, course) => ({
    subject: `${announcement.priority.toUpperCase()}: ${announcement.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: ${announcement.priority === 'urgent' ? '#dc2626' : '#4f46e5'};">
          ${announcement.priority === 'urgent' ? '🚨 URGENT' : '📢'} Announcement
        </h1>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>${announcement.title}</h3>
          ${course ? `<p><strong>Course:</strong> ${course.courseCode} - ${course.title}</p>` : ''}
          <p><strong>Type:</strong> ${announcement.type}</p>
          <p><strong>Priority:</strong> ${announcement.priority}</p>
        </div>
        <p>${announcement.content}</p>
        <a href="${process.env.FRONTEND_URL}/announcements/${announcement._id}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Announcement</a>
      </div>
    `
  }),

  passwordReset: (user, resetToken) => ({
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4f46e5;">Password Reset Request</h1>
        <p>Hello ${user.firstName},</p>
        <p>You have requested to reset your password. Click the button below to reset it:</p>
        <a href="${process.env.FRONTEND_URL}/reset-password/${resetToken}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">Reset Password</a>
        <p>This link will expire in 10 minutes.</p>
        <p>If you did not request this password reset, please ignore this email.</p>
      </div>
    `
  }),

  emailVerification: (user, verificationToken) => ({
    subject: 'Verify Your Email Address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4f46e5;">Verify Your Email Address</h1>
        <p>Hello ${user.firstName},</p>
        <p>Please verify your email address by clicking the button below:</p>
        <a href="${process.env.FRONTEND_URL}/verify-email/${verificationToken}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">Verify Email</a>
        <p>If you did not create an account, please ignore this email.</p>
      </div>
    `
  })
};

// Send specific email types
const sendWelcomeEmail = async (user) => {
  const template = emailTemplates.welcome(user);
  return await sendEmail({
    email: user.email,
    ...template
  });
};

const sendAssignmentNotification = async (emails, assignment, course) => {
  const template = emailTemplates.assignmentCreated(assignment, course);
  
  // Send to multiple recipients
  const promises = emails.map(email => 
    sendEmail({
      email,
      ...template
    })
  );
  
  return await Promise.allSettled(promises);
};

const sendGradeNotification = async (studentEmail, grade, assignment, course) => {
  const template = emailTemplates.gradePosted(grade, assignment, course);
  return await sendEmail({
    email: studentEmail,
    ...template
  });
};

const sendAnnouncementNotification = async (emails, announcement, course) => {
  const template = emailTemplates.announcementCreated(announcement, course);
  
  const promises = emails.map(email => 
    sendEmail({
      email,
      ...template
    })
  );
  
  return await Promise.allSettled(promises);
};

const sendPasswordResetEmail = async (user, resetToken) => {
  const template = emailTemplates.passwordReset(user, resetToken);
  return await sendEmail({
    email: user.email,
    ...template
  });
};

const sendEmailVerification = async (user, verificationToken) => {
  const template = emailTemplates.emailVerification(user, verificationToken);
  return await sendEmail({
    email: user.email,
    ...template
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendAssignmentNotification,
  sendGradeNotification,
  sendAnnouncementNotification,
  sendPasswordResetEmail,
  sendEmailVerification
};