import { Box, Container, Typography } from '@mui/material';
import BookingForm from '@/components/BookingForm';

const BookingPage = () => {
  return (
    <Box sx={{ my: 6, py: 6, minHeight: 'calc(100vh - 400px)' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h2" className="font-serif font-bold mb-3" sx={{ color: 'hsl(var(--primary))' }}>
            Reserve Your Table
          </Typography>
          <Typography variant="h6" sx={{ color: 'hsl(var(--muted-foreground))', fontWeight: 300, mb: 2 }}>
            Book your dining experience today
          </Typography>
          <Typography variant="body1" sx={{ maxWidth: 600, mx: 'auto', color: 'hsl(var(--muted-foreground))' }}>
            We look forward to serving you. Please fill out the form below to make a reservation.
            We'll confirm your booking via email shortly.
          </Typography>
        </Box>
        <BookingForm />
      </Container>
    </Box>
  );
};

export default BookingPage;