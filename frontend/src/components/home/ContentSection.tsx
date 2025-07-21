import { Box, Typography, Button, Stack } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

export default function ContentSection() {
  return (
    <>
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', padding: { xs: '4rem 1rem', md: '6rem 2rem' }, overflow: 'hidden', backgroundColor: '#f4f4f4' }}>
        <Box
          sx={{
            width: '100%',
            maxWidth: 1200, // Einheitliche Breite
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3rem',
            boxSizing: 'border-box',
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: '2rem', md: '2.8rem' },
              fontWeight: 700,
              color: '#222',
              textAlign: 'center',
              maxWidth: 1200,
            }}
          >
            Die smarte Gutschein-Plattform für Ihr Unternehmen
          </Typography>

          <Typography
            sx={{
              maxWidth: 1100,
              fontSize: '1.25rem',
              color: '#555',
              textAlign: 'center',
              lineHeight: 1.6,
            }}
          >
            Verkaufen Sie Gutscheine digital – unkompliziert, sicher und mit voller Kontrolle. Keine technischen Vorkenntnisse nötig. Wir kümmern uns um den Rest.
          </Typography>

          <Stack
            direction="row"
            justifyContent="center"
            flexWrap="wrap"
            sx={{ gap: '3rem', rowGap: '4rem' }}
          >
            <Box sx={{ minWidth: 250, maxWidth: 350, flex: '1 1 300px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <VerifiedIcon sx={{ fontSize: 50, color: '#4F46E5' }} />
              <Typography sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                Einfach & zuverlässig
              </Typography>
              <Typography sx={{ color: '#666', fontSize: '0.95rem' }}>
                Gutscheine erstellen, verwalten und verkaufen – alles zentral an einem Ort.
              </Typography>
            </Box>

            <Box sx={{ minWidth: 250, maxWidth: 350, flex: '1 1 300px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <AccessTimeIcon sx={{ fontSize: 50, color: '#4F46E5' }} />
              <Typography sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                Startbereit in Minuten
              </Typography>
              <Typography sx={{ color: '#666', fontSize: '0.95rem' }}>
                Keine lange Einrichtung – direkt loslegen und Umsatz steigern.
              </Typography>
            </Box>

            <Box sx={{ minWidth: 250, maxWidth: 350, flex: '1 1 300px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <MonetizationOnIcon sx={{ fontSize: 50, color: '#4F46E5' }} />
              <Typography sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                Mehr Umsatz generieren
              </Typography>
              <Typography sx={{ color: '#666', fontSize: '0.95rem' }}>
                Nutzen Sie das volle Potenzial von digitalen Gutscheinen für Ihr Geschäft.
              </Typography>
            </Box>
          </Stack>

          <Button
            variant="contained"
            sx={{
              backgroundColor: '#4F46E5',
              fontSize: '1rem',
              padding: '0.9rem 2.2rem',
              borderRadius: '0.6rem',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { backgroundColor: '#4338ca' },
              marginTop: '2rem',
            }}
          >
            Jetzt starten
          </Button>
        </Box>
      </Box>
    </>
  );
}
