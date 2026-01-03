// ...existing code...
import React from 'react';

const Logo = (props) => (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M0 8C0 3.58172 3.58172 0 8 0H32C36.4183 0 40 3.58172 40 8V32C40 36.4183 36.4183 40 32 40H8C3.58172 40 0 36.4183 0 32V8Z" fill="url(#paint0_linear_70_802)"/>
      <path d="M29.42 18.922C29.5991 18.843 29.751 18.7133 29.857 18.5488C29.963 18.3843 30.0184 18.1924 30.0164 17.9967C30.0143 17.8011 29.955 17.6103 29.8456 17.4481C29.7362 17.2858 29.5817 17.1592 29.401 17.084L20.83 13.18C20.5695 13.0611 20.2864 12.9996 20 12.9996C19.7137 12.9996 19.4306 13.0611 19.17 13.18L10.6 17.08C10.422 17.158 10.2706 17.2861 10.1642 17.4488C10.0579 17.6115 10.0012 17.8016 10.0012 17.996C10.0012 18.1903 10.0579 18.3805 10.1642 18.5432C10.2706 18.7059 10.422 18.834 10.6 18.912L19.17 22.82C19.4306 22.9388 19.7137 23.0003 20 23.0003C20.2864 23.0003 20.5695 22.9388 20.83 22.82L29.42 18.922Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M30 18V24" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 20.5V24C14 24.7956 14.6321 25.5587 15.7574 26.1213C16.8826 26.6839 18.4087 27 20 27C21.5913 27 23.1174 26.6839 24.2426 26.1213C25.3679 25.5587 26 24.7956 26 24V20.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <defs>
        <linearGradient id="paint0_linear_70_802" x1="0" y1="20" x2="40" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#155DFC"/>
          <stop offset="1" stopColor="#1447E6"/>
        </linearGradient>
      </defs>
    </svg>
);

export default Logo;