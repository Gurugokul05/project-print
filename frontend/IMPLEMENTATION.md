# Xerox Queue - Online Print Ordering System

A modern web portal for reducing queue times at xerox/print shops. Users can upload files, select print settings, make payments, and collect their printouts with QR code verification.

## Features

### ✅ Implemented
- **File Upload**: Support for PDF, DOCX, PPT, PNG, JPG files
- **Print Customization**: Select paper size, print type (B&W/Color), single/double-sided, copies
- **Cost Estimation**: Real-time price calculation based on settings
- **Multi-Step Order Flow**:
  - Step 1: Upload files and select print details
  - Step 2: Review order and make payment
  - Step 3: Get confirmation with QR code
- **QR Code Generation**: Unique QR code for each order containing:
  - Order ID
  - Payment ID
  - Customer name
  - Phone number
- **QR Code Download**: Users can download their QR code for later scanning
- **Order Confirmation**: Display order details and pickup time
- **Responsive Design**: Works on desktop and mobile devices

### 📋 Ready for Backend Integration
- API service layer (`src/api.js`) configured for backend communication
- Order submission endpoint
- Payment processing endpoint
- Order status tracking
- File upload handling
- Queue status retrieval

## Tech Stack

- **Frontend**: React 19.2 + Vite
- **QR Code**: qrcode library
- **Styling**: CSS with design system variables
- **State Management**: React hooks (useState)

## Installation

```bash
cd frontend
npm install
```

## Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Building

```bash
npm run build
```

## Environment Configuration

Create a `.env` file based on `.env.example`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Project Structure

```
frontend/
├── src/
│   ├── App.jsx           # Main component with order flow
│   ├── App.css           # Application styles
│   ├── index.css         # Global styles and design variables
│   ├── api.js            # Backend API service layer
│   └── main.jsx          # Entry point
├── package.json
├── vite.config.js
└── .env.example
```

## Backend Integration

The frontend is ready to connect to a Node.js + Express.js backend. The API service layer handles:

### Endpoints Needed

```
POST   /api/orders           - Submit new order
GET    /api/orders/:id       - Get order status
POST   /api/payments         - Process payment
POST   /api/uploads          - Upload print files
GET    /api/queue            - Get current queue status
```

### Order Data Structure

```javascript
{
  id: "ORD-1234567890-ABC123",
  customerName: "John Doe",
  phone: "9876543210",
  files: ["document.pdf", "report.docx"],
  paperSize: "A4",
  printType: "bw",
  copies: 2,
  sides: "double",
  notes: "Staple on left side",
  totalPrice: 24,
  totalPages: 10,
  pickupTime: "4:30 PM",
  paymentId: "PAY-1234567890",
  status: "paid"
}
```

## Key Features Implementation

### QR Code Generation
- Uses `qrcode` library to generate QR codes
- QR code contains order and payment information
- Users can download QR code as PNG
- Shop staff can scan QR code to verify customer and order

### Real-time Cost Estimation
- Black & White: ₹2 per page
- Color: ₹6 per page
- Double-sided discount: 15% off
- Formula: `pages × baseRate × sidesDiscount`

### Form Validation
- Required fields validation
- Phone number format check (min 10 digits)
- File upload verification
- Error messages displayed to user

## Future Enhancements

1. **Payment Gateway Integration**: Razorpay, PhonePe, etc.
2. **Order Tracking**: Real-time status updates via WebSocket
3. **WhatsApp Notifications**: Send pickup alerts via WhatsApp
4. **User Accounts**: Save orders and preferences
5. **Rating System**: Customer feedback for shops
6. **Admin Dashboard**: For print shop management
7. **Multiple File Format Support**: Support more file types
8. **Batch Orders**: Manage multiple orders at once

## Development Notes

- The app uses React 19.2.4 which requires the latest tooling
- CORS will need to be configured on the backend for API calls
- File uploads should be handled on the backend with proper validation
- QR codes are generated client-side to reduce server load

## License

MIT
