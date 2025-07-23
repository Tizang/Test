import { Box, Typography, Button, Stack } from '@mui/material';
import { useGutschein } from '../../context/GutscheinContext';
import { Email, Phone, Person, Business, DesignServices, Image as ImageIcon, Build } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function Zusammenfassung() {
  const { data, clearData } = useGutschein();
  const navigate = useNavigate();

  const handlePreview = () => {
    navigate('/checkoutc');
  };

  return (
    <Box sx={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      <Typography sx={{ fontSize: '2rem', fontWeight: 700 }}>
        Zusammenfassung
      </Typography>
      <Typography sx={{ fontSize: '1rem', color: '#666', mb: '1rem' }}>
        Sie können Ihre Daten jederzeit auf unserer Website ändern.
      </Typography>

      {/* Persönliche Daten */}
      <Box sx={{ border: '1px solid #ddd', borderRadius: '1rem', padding: '2rem', backgroundColor: '#FAFAFA' }}>
        <Typography sx={{ fontWeight: 500, mb: '1.5rem', color: '#333' }}>
          Persönliche Daten:
        </Typography>
        
        <Stack spacing={2}>
          <Stack direction="row" spacing={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
              <Person sx={{ color: '#4CAF50', fontSize: '1.5rem' }} />
              <Typography sx={{ fontWeight: 500 }}>Name: {data.nachname}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
              <Email sx={{ color: '#2196F3', fontSize: '1.5rem' }} />
              <Typography sx={{ fontWeight: 500 }}>E-Mail: {data.email}</Typography>
            </Box>
          </Stack>
          
          <Stack direction="row" spacing={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
              <Phone sx={{ color: '#FF9800', fontSize: '1.5rem' }} />
              <Typography sx={{ fontWeight: 500 }}>Telefon: {data.telefon}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
              <Business sx={{ color: '#9C27B0', fontSize: '1.5rem' }} />
              <Typography sx={{ fontWeight: 500 }}>IBAN: {data.iban}</Typography>
            </Box>
          </Stack>
        </Stack>
      </Box>

      {/* Gutschein-Design */}
      <Box sx={{ border: '1px solid #ddd', borderRadius: '1rem', padding: '2rem', backgroundColor: '#FAFAFA' }}>
        <Typography sx={{ fontWeight: 500, mb: '1.5rem', color: '#333' }}>
          Gutschein-Design:
        </Typography>
        
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {data.gutscheinDesign?.modus === 'wir-designen' ? (
              <DesignServices sx={{ color: '#FF5722', fontSize: '1.5rem' }} />
            ) : data.gutscheinDesign?.modus === 'eigenes' ? (
              <ImageIcon sx={{ color: '#2196F3', fontSize: '1.5rem' }} />
            ) : (
              <Build sx={{ color: '#4CAF50', fontSize: '1.5rem' }} />
            )}
            <Typography sx={{ fontWeight: 500 }}>
              Modus: {
                data.gutscheinDesign?.modus === 'wir-designen' 
                  ? 'Wir designen den Gutschein' 
                  : data.gutscheinDesign?.modus === 'eigenes'
                  ? 'Eigenes Design hochgeladen'
                  : 'Unser Standard-Design'
              }
            </Typography>
          </Box>

          {/* Hochgeladenes Design anzeigen */}
          {data.gutscheinDesign?.modus === 'eigenes' && data.gutscheinDesign?.hintergrund && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                Hochgeladenes Design:
              </Typography>
              <Box
                sx={{
                  width: 200,
                  height: 150,
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f5f5f5',
                }}
              >
                {data.gutscheinDesign.hintergrundTyp === 'image' ? (
                  <img
                    src={data.gutscheinDesign.hintergrund}
                    alt="Hochgeladenes Design"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
                ) : (
                  <Box sx={{ textAlign: 'center' }}>
                    <ImageIcon sx={{ fontSize: 40, color: '#666' }} />
                    <Typography variant="body2" color="text.secondary">
                      PDF-Datei ({data.gutscheinDesign.hintergrundTyp})
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}

          {data.gutscheinDesign?.modus === 'wir-designen' && (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              Unser Team erstellt ein individuelles Design basierend auf Ihrer Website und Ihren Angaben.
            </Typography>
          )}

          {data.gutscheinDesign?.modus === 'unser-design' && (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              Sie verwenden unser professionelles Standard-Design.
            </Typography>
          )}
        </Stack>
      </Box>

      <Stack direction="row" spacing={2} sx={{ mt: '2rem' }}>
        <Button
          variant="contained"
          onClick={handlePreview}
          sx={{
            backgroundColor: '#607D8B',
            color: '#fff',
            padding: '0.75rem 2rem',
            fontSize: '1rem',
            fontWeight: 600,
            borderRadius: '2rem',
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
            '&:hover': {
              backgroundColor: '#546E7A',
            },
          }}
        >
          Vorschau: Was sieht Ihr Kunde
        </Button>
      </Stack>

      {/* Reset-Button */}
      <Button
        variant="outlined"
        onClick={() => clearData()}
        sx={{
          mt: '1rem',
          color: '#FF5722',
          borderColor: '#FF5722',
          padding: '0.5rem 1.5rem',
          fontSize: '0.875rem',
          fontWeight: 500,
          borderRadius: '2rem',
          '&:hover': {
            backgroundColor: '#FFEBEE',
            borderColor: '#FF5722',
          },
        }}
      >
        Zurücksetzen
      </Button>

    </Box>
  );
}
