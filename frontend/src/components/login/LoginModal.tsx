import { Modal, Box, Typography, TextField, Button, Divider, Link } from '@mui/material';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from '../../auth/firebase';
import { doc, setDoc, getDoc, DocumentReference } from "firebase/firestore";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Importiere useNavigate

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function LoginModal({ open, onClose }: Props) {
  const navigate = useNavigate(); // Initialisiere den Navigator

  const [email, setEmail] = useState('');
  const [passwort, setPasswort] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false);
        setIsRegister(false); // Zurück auf Login-Ansicht für das nächste Öffnen
        onClose(); // Modal schließen
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [success, onClose]);

  const mergeUserData = async (userDocRef: DocumentReference, newUserData: Record<string, any>) => {
    const userDoc = await getDoc(userDocRef);

    const currentMonth = new Date().toLocaleDateString('de-DE', { year: 'numeric', month: '2-digit' }); // Format: MM.YYYY

    if (userDoc.exists()) {
        const existingData = userDoc.data() as Record<string, any>;
        const monthlyData = existingData.Einnahmen?.monatlich || {};

        // Falls der aktuelle Monat nicht existiert, füge ihn hinzu
        if (!monthlyData[currentMonth]) {
            monthlyData[currentMonth] = {
                verkaufteGutscheine: 0,
                gesamtUmsatz: 0,
            };
        }

        // Datenfelder zusammenführen, ohne Überschreiben
        const mergedGutscheine = {
            ...newUserData.Gutscheine,
            ...existingData.Gutscheine, // Bestehende Gutscheine beibehalten
        };

        const mergedUnternehmensdaten = {
            ...newUserData.Unternehmensdaten,
            ...existingData.Unternehmensdaten, // Bestehende Unternehmensdaten beibehalten
        };

        const mergedZahlungsdaten = {
            ...newUserData.Zahlungsdaten,
            ...existingData.Zahlungsdaten, // Bestehende Zahlungsdaten beibehalten
        };

        const mergedGutscheindetails = {
            ...newUserData.Gutscheindetails,
            ...existingData.Gutscheindetails, // Bestehende Gutscheindetails beibehalten
        };

        const mergedCheckout = {
            ...newUserData.Checkout,
            ...existingData.Checkout, // Bestehende Checkout-Daten beibehalten
        };

        const mergedData = {
            ...newUserData,
            ...existingData,
            Gutscheine: mergedGutscheine,
            Unternehmensdaten: mergedUnternehmensdaten,
            Zahlungsdaten: mergedZahlungsdaten,
            Gutscheindetails: mergedGutscheindetails,
            Checkout: mergedCheckout,
            Einnahmen: {
                ...newUserData.Einnahmen,
                ...existingData.Einnahmen,
                monatlich: monthlyData,
            },
        };

        // Speichere die zusammengeführten Daten in der Datenbank
        await setDoc(userDocRef, mergedData);
    } else {
        // Initialisiere die monatlichen Daten für den aktuellen Monat
        newUserData.Einnahmen.monatlich = {
            [currentMonth]: {
                verkaufteGutscheine: 0,
                gesamtUmsatz: 0,
            },
        };

        await setDoc(userDocRef, newUserData);
    }
  };

  // Funktion zur Erstellung von Standard-Benutzerdaten
  const createDefaultUserData = (email: string) => {
    const currentMonth = new Date().toLocaleDateString('de-DE', { year: 'numeric', month: '2-digit' }); // Format: MM.YYYY

    return {
      email,
      createdAt: new Date(),
      registrationFinished: false,
      slug: "",
      Unternehmensdaten: {
        Vorname: "",
        Name: "",
        Unternehmensname: "",
        Branche: "",
        Telefon: "",
      },
      Checkout: {
        Unternehmensname: "",
        Gutscheinarten: {},
        BildURL: "",
        GutscheinURL: "",
        Dienstleistung: false, // Ändere Boolean zu boolean
        Freibetrag: false,     // Ändere Boolean zu boolean
      },
      Einnahmen: {
        gesamtUmsatz: 0,
        anzahlVerkäufe: 0,
        letzterVerkauf: null,
        umsatzLetzterMonat: 0,
        verkäufeLetzterMonat: 0,
        monatlich: {
          [currentMonth]: {
            verkaufteGutscheine: 0,
            gesamtUmsatz: 0,
          },
        },
      },
      Zahlungsdaten: {
        Zahlungsempfänger: "",
        IBAN: "",
      },
      Gutscheine: {
        Beispiel123: {
          gutscheinCode: "Beispiel123",
          wert: 0,
          verkauftAm: null
        }
      },
      Gutscheindetails: {
        Gutscheindesign: {},
        Gutscheinarten: {
        },
      },
    };
  };

  const handleLogin = () => {
    if (!email || !passwort) {
      setLoginError("Bitte E-Mail und Passwort eingeben.");
      return;
    }

    setLoginError("");

    signInWithEmailAndPassword(auth, email, passwort)
      .then(async (res) => {
        const user = res.user;
        const userDocRef = doc(db, "users", user.uid);

        const userDoc = await getDoc(userDocRef);
        const registrationFinished = userDoc.exists() && userDoc.data().registrationFinished;

        if (registrationFinished) {
          navigate('/profil'); // Navigiere zu /profil
        } else {
          navigate('/gutschein/step1'); // Navigiere zu /gutschein/step1
        }

        setSuccess(true);
      })
      .catch((err) => {
        setLoginError("E-Mail oder Passwort ist falsch.");
      });
  };

  const handleRegister = () => {
    if (!email || !passwort) {
      setLoginError("Bitte E-Mail und Passwort eingeben.");
      return;
    }

    setLoginError("");

    createUserWithEmailAndPassword(auth, email, passwort)
      .then(async (res) => {
        const newUserData = createDefaultUserData(res.user.email || "");

        await setDoc(doc(db, "users", res.user.uid), newUserData);

        navigate('/gutschein/step1'); // Nach Registrierung immer zu /gutschein/step1
        setSuccess(true);
      })
      .catch((err) => {
        switch (err.code) {
          case "auth/email-already-in-use":
            setLoginError("Diese E-Mail-Adresse wird bereits verwendet.");
            break;
          case "auth/invalid-email":
            setLoginError("Die eingegebene E-Mail-Adresse ist ungültig.");
            break;
          case "auth/weak-password":
            setLoginError("Das Passwort ist zu schwach. Bitte wähle ein stärkeres Passwort.");
            break;
          default:
            setLoginError("Registrierung fehlgeschlagen: " + err.message);
        }
      });
  };

  const handlePasswordReset = () => {
    if (!resetEmail) {
      setResetError("Bitte geben Sie Ihre E-Mail-Adresse ein.");
      return;
    }

    setResetError("");

    sendPasswordResetEmail(auth, resetEmail)
      .then(() => {
        setResetSuccess(true);
        setTimeout(() => {
          setResetPasswordOpen(false);
          setResetSuccess(false);
        }, 2000);
      })
      .catch((err) => {
        setResetError("Passwort-Zurücksetzen fehlgeschlagen: " + err.message);
      });
  };

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 420,
            bgcolor: 'white',
            borderRadius: 4,
            boxShadow: 24,
            p: 5,
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            alignItems: 'center',
          }}
        >
          {success ? (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" sx={{ color: 'green', fontWeight: 700 }}>
                Erfolgreich!
              </Typography>
              <Typography sx={{ fontSize: '2rem', color: 'green' }}>✔</Typography>
            </Box>
          ) : (
            <>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {isRegister ? "Registrieren" : "Anmelden"}
              </Typography>

              <Typography sx={{ textAlign: 'center', color: '#666', fontSize: '0.95rem', mb: 2 }}>
                {isRegister
                  ? "Erstelle deinen Account, um Gutscheine zu verwalten."
                  : "Melde dich an, um deine Gutscheine einfach zu verwalten."
                }
              </Typography>

              <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="E-Mail"
                  variant="outlined"
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: '#f5f5f5',
                    },
                  }}
                />

                <TextField
                  label="Passwort"
                  type="password"
                  variant="outlined"
                  fullWidth
                  value={passwort}
                  onChange={(e) => setPasswort(e.target.value)}
                  error={Boolean(loginError && !isRegister)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: '#f5f5f5',
                    },
                  }}
                />

                {!isRegister && (
                  <Box sx={{ textAlign: 'right', mt: '-0.5rem' }}>
                    <Link
                      href="#"
                      underline="hover"
                      sx={{ fontSize: '0.85rem', color: '#4F46E5', fontWeight: 500 }}
                      onClick={() => setResetPasswordOpen(true)}
                    >
                      Passwort vergessen?
                    </Link>
                  </Box>
                )}
              </Box>

              {loginError && (
                <Typography sx={{ color: 'red', fontSize: '0.85rem', mt: 1, textAlign: 'center' }}>
                  {loginError}
                </Typography>
              )}

              <Button
                fullWidth
                sx={{
                  backgroundColor: '#4F46E5',
                  color: 'white',
                  textTransform: 'none',
                  fontWeight: 600,
                  padding: '0.9rem',
                  borderRadius: 3,
                  mt: 1,
                  '&:hover': { backgroundColor: '#4338CA' },
                }}
                onClick={isRegister ? handleRegister : handleLogin}
              >
                {isRegister ? "Jetzt registrieren" : "Jetzt einloggen"}
              </Button>

              <Divider sx={{ width: '100%', my: 2 }} />

              <Typography sx={{ fontSize: '0.9rem', color: '#555' }}>
                {isRegister ? "Du hast bereits ein Konto?" : "Du hast noch kein Konto?"}{" "}
                <span
                  style={{ color: '#4F46E5', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setLoginError("");
                  }}
                >
                  {isRegister ? "Anmelden" : "Registrieren"}
                </span>
              </Typography>
            </>
          )}
        </Box>
      </Modal>

      <Modal open={resetPasswordOpen} onClose={() => setResetPasswordOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 420,
            bgcolor: 'white',
            borderRadius: 4,
            boxShadow: 24,
            p: 5,
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            alignItems: 'center',
          }}
        >
          {resetSuccess ? (
            <Typography variant="h5" sx={{ color: 'green', fontWeight: 700 }}>
              Eine E-Mail zum Zurücksetzen Ihres Passworts wurde gesendet!
            </Typography>
          ) : (
            <>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Passwort zurücksetzen
              </Typography>

              <TextField
                label="E-Mail-Adresse"
                variant="outlined"
                fullWidth
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: '#f5f5f5',
                  },
                }}
              />

              {resetError && (
                <Typography sx={{ color: 'red', fontSize: '0.85rem', mt: 1, textAlign: 'center' }}>
                  {resetError}
                </Typography>
              )}

              <Button
                fullWidth
                sx={{
                  backgroundColor: '#4F46E5',
                  color: 'white',
                  textTransform: 'none',
                  fontWeight: 600,
                  padding: '0.9rem',
                  borderRadius: 3,
                  mt: 1,
                  '&:hover': { backgroundColor: '#4338CA' },
                }}
                onClick={handlePasswordReset}
              >
                Passwort zurücksetzen
              </Button>
            </>
          )}
        </Box>
      </Modal>
    </>
  );
}
