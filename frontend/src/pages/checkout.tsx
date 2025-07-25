import { Box, Typography, Button, IconButton, Stack } from '@mui/material';
import { useState, useEffect, useRef } from 'react';
import UploadIcon from '@mui/icons-material/Upload';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AppleIcon from '@mui/icons-material/Apple';
import GoogleIcon from '@mui/icons-material/Google';
import TopLeftLogo from '../components/home/TopLeftLogo';

import { storage } from '../auth/firebase';
import { ref, getDownloadURL } from 'firebase/storage';

function PaymentOptions({ onSelect }: { onSelect: (m: string) => void }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mt: 2 }}>
      <Button variant="outlined" startIcon={<CreditCardIcon />} onClick={() => onSelect('creditcard')} sx={{ flex: 1 }}>
        Kreditkarte
      </Button>
      <Button variant="outlined" startIcon={<AppleIcon />} onClick={() => onSelect('applepay')} sx={{ flex: 1 }}>
        Apple Pay
      </Button>
      <Button variant="outlined" startIcon={<GoogleIcon />} onClick={() => onSelect('googlepay')} sx={{ flex: 1 }}>
        Google Pay
      </Button>
    </Box>
  );
}




function PaymentForm({ betrag, customerEmail }: { betrag: number | null; customerEmail: string }) {
  const [method, setMethod] = useState<string | null>(null);

  const cardRef = useRef<HTMLDivElement | null>(null);
  const mollieRef = useRef<any>(null);
  const cardComponent = useRef<any>(null);

  // load Mollie script when credit card is selected
  useEffect(() => {
    if (method !== 'creditcard' || mollieRef.current) return;
    const script = document.createElement('script');
    script.src = 'https://js.mollie.com/v1/mollie.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      const Mollie = (window as any).Mollie;
      if (!Mollie) return;
      mollieRef.current = Mollie('test_dummy', { locale: 'de_DE' });
      cardComponent.current = mollieRef.current.createComponent('card');
      cardComponent.current.mount(cardRef.current!);
    };
    document.body.appendChild(script);
  }, [method]);

  const handlePayment = async () => {
    if (!betrag || !method) {
      alert('Bitte wählen Sie eine Zahlungsmethode und geben Sie einen Betrag ein.');
      return;
    }

    // direct credit card payment
    if (method === 'creditcard' && mollieRef.current && cardComponent.current) {
      try {
        const { token, error } = await mollieRef.current.createToken(cardComponent.current);
        if (error) {
          alert(error.message);
          return;
        }
        const response = await fetch('https://gutscheinery.de/api/zahlung/create-payment-direct', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: betrag * 100, customerEmail, cardToken: token }),
        });
        if (!response.ok) {
          const err = await response.json();
          alert('Zahlung fehlgeschlagen: ' + (err.error || ''));
          return;
        }
        alert('Zahlung erfolgreich!');
      } catch (err: any) {
        alert('Zahlung fehlgeschlagen: ' + err.message);
      }
      return;
    }

    // fallback: redirect to Mollie hosted page

    const response = await fetch('https://gutscheinery.de/api/zahlung/create-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: betrag * 100, customerEmail, method }),
    });

    if (!response.ok) {
      alert('Zahlung fehlgeschlagen');
      return;
    }

    const { paymentUrl } = await response.json();
    window.location.href = paymentUrl;
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Zahlungsmethode wählen:
      </Typography>
      <PaymentOptions onSelect={setMethod} />
      {method === 'creditcard' && (
        <Box sx={{ mt: 2 }}>
          <div id="card-field" ref={cardRef} />
        </Box>
      )}
      <Button
        variant="contained"
        size="large"
        sx={{
          borderRadius: 2,
          px: 4,
          py: 1.5,
          backgroundColor: '#e0e0e0',
          color: '#000',
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: 3,
          '&:hover': { backgroundColor: '#bdbdbd' },
          mt: 2,
        }}
        onClick={handlePayment}
      >
        Zahlung abschließen
      </Button>
    </Box>
  );
}

export default function GutscheinLandingPage() {
  const [hintergrundBild, setHintergrundBild] = useState<string | null>(null);
  const [gutscheinBild, setGutscheinBild] = useState<string | null>(null);
  const [betrag, setBetrag] = useState<number | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [customerEmail, setCustomerEmail] = useState<string>("");

  const kundenName = "Rümenapf Buch am Erlbach";
  const beschreibung = "Ihr Gutschein kann direkt nach dem Kauf per E-Mail versendet oder ausgedruckt werden.";

  // Firebase Storage Bild laden
  useEffect(() => {
    const loadStartImage = async () => {
      try {
        const imageRef = ref(storage, 'start.jpg');
        const imageUrl = await getDownloadURL(imageRef);
        setHintergrundBild(imageUrl);
      } catch (error) {
        console.error('Fehler beim Laden des Bildes:', error);
      }
    };

    loadStartImage();
  }, []);

  const handleHintergrundUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setHintergrundBild(URL.createObjectURL(file));
    }
  };

  const handleWeiterZurBestellung = () => {
    if (!betrag) {
      alert('Bitte geben Sie einen Betrag ein.');
      return;
    }
    setShowPaymentForm(true);
  };

  return (
      <Box sx={{ minHeight: '100vh', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
        <TopLeftLogo />
        <Box sx={{ position: 'absolute', top: { xs: '0.5rem', md: '1.5rem' }, left: { xs: '1rem', md: '4rem' }, zIndex: 3 }}>
        </Box>

        <Box
          sx={{
            width: { xs: '100%', md: '50%' },
            backgroundColor: '#fff',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            p: { xs: 4, md: 8 },
          }}
        >
          <Box sx={{ maxWidth: '450px', width: '100%', textAlign: { xs: 'center', md: 'left' }, mt: { xs: 6, md: -2 } }}>
            <Typography variant="h5" sx={{ fontWeight: 500, mb: 1, color: 'grey.600' }}>
              Gutschein für
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 4, color: 'grey.800' }}>
              {kundenName}
            </Typography>

            <Typography variant="h6" sx={{ color: 'grey.700', mb: 4 }}>
              {beschreibung}
            </Typography>

            {!showPaymentForm && (
              <>
                <Typography variant="body1" sx={{ fontWeight: 700, mb: 2 }}>
                  An welche E-Mail Adresse soll der Gutschein geschickt werden?
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' }, alignItems: 'center', mb: 4 }}>
                  <input
                    type="email"
                    placeholder="E-Mail eingeben"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    style={{
                      padding: '1rem',
                      borderRadius: '8px',
                      border: '1px solid #ccc',
                      width: '300px',
                      fontSize: '1rem',
                    }}
                  />
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 700, mb: 2 }}>
                  Welchen Betrag möchten Sie schenken?
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' }, alignItems: 'center', mb: 4 }}>
                  <input
                    type="number"
                    placeholder="Betrag eingeben"
                    value={betrag || ''}
                    onChange={(e) => setBetrag(Number(e.target.value))}
                    style={{
                      padding: '1rem',
                      borderRadius: '8px',
                      border: '1px solid #ccc',
                      width: '200px',
                      fontSize: '1.2rem',
                      marginRight: '1rem',
                    }}
                  />
                  <Typography variant="body1" sx={{ fontSize: '1.2rem' }}>€</Typography>
                </Box>
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    backgroundColor: '#e0e0e0',
                    color: '#000',
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: 3,
                    '&:hover': { backgroundColor: '#bdbdbd' },
                  }}
                  endIcon={<ArrowForwardIosIcon />}
                  onClick={handleWeiterZurBestellung}
                >
                  Weiter zur Bestellung
                </Button>
              </>
            )}

            {showPaymentForm && <PaymentForm betrag={betrag} customerEmail={customerEmail} />}
          </Box>
        </Box>

        <Box
          sx={{
            width: { xs: '100%', md: '50%' },
            position: 'relative',
            backgroundImage: hintergrundBild ? `url(${hintergrundBild})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: '#222',
            minHeight: hintergrundBild ? { xs: '300px', md: 'auto' } : { xs: '0', md: 'auto' },
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            p: 2,
          }}
        >
          <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
          </Box>
        </Box>
      </Box>
  );
}