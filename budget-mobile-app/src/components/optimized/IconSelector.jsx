import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  IconButton,
  Box,
  Typography,
  TextField,
  InputAdornment,
  Chip
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Save,
  Cancel,
  Category,
  ColorLens,
  Palette,
  CheckCircle,
  Warning,
  MoreVert,
  TrendingDown,
  TrendingUp,
  AttachMoney,
  ShoppingCart,
  Restaurant,
  DirectionsCar,
  Home,
  School,
  SportsEsports,
  LocalHospital,
  Work,
  Business,
  AccountBalance,
  Computer,
  Person,
  MonetizationOn,
  LocalGroceryStore,
  LocalDining,
  LocalGasStation,
  LocalPharmacy,
  LocalLibrary,
  LocalGym,
  LocalBar,
  LocalCafe,
  LocalPizza,
  LocalLaundryService,
  LocalTaxi,
  DirectionsBus,
  Train,
  Flight,
  DirectionsBike,
  LocalParking,
  AccountBalanceWallet,
  LocalPostOffice,
  LocalPrintshop,
  LocalFlorist,
  LocalConvenienceStore,
  LocalMall,
  LocalMovies,
  LocalTheater,
  MusicNote,
  LocalArtGallery,
  Museum,
  LocalZoo,
  Park,
  BeachAccess,
  Pool,
  LocalFitnessCenter,
  LocalSpa,
  LocalBeautySalon,
  LocalBarberShop,
  LocalDryCleaning,
  LocalCarWash,
  Build,
  Hardware,
  LocalPlumber,
  LocalElectrician,
  LocalCarpenter,
  LocalPaint,
  CleaningServices,
  Security,
  LocalPolice,
  LocalFireDepartment,
  LocalClinic,
  LocalDentist,
  LocalOptician,
  LocalVet,
  LocalPetStore,
  LocalGardenCenter,
  LocalNursery,
  LocalFarm,
  LocalMarket,
  LocalBakery,
  LocalButcher,
  LocalFishMarket,
  LocalWineBar,
  LocalBrewery,
  LocalDistillery,
  LocalTobacco,
  LocalLiquorStore,
  LocalCarRental,
  LocalBikeRental,
  LocalScooterRental,
  LocalBoatRental,
  LocalHelicopter,
  LocalPlane,
  LocalShip,
  DirectionsSubway,
  LocalSki,
  LocalSnowboarding,
  LocalSurfing,
  LocalSkateboarding,
  LocalRollerSkating,
  LocalIceSkating,
  LocalBowling,
  LocalGolf,
  LocalTennis,
  LocalBasketball,
  LocalSoccer,
  LocalFootball,
  LocalBaseball,
  LocalHockey,
  LocalVolleyball,
  LocalBadminton,
  LocalTableTennis,
  LocalSwimming,
  LocalDiving,
  LocalWaterPolo,
  LocalRowing,
  LocalCanoe,
  LocalKayak,
  LocalRafting,
  LocalFishing,
  LocalHunting,
  LocalCamping,
  LocalHiking,
  LocalClimbing,
  LocalMountainBiking,
  LocalRoadBiking,
  LocalCycling,
  LocalRunning,
  LocalWalking,
  LocalJogging,
  LocalYoga,
  LocalPilates,
  LocalMeditation,
  LocalTaiChi,
  LocalKarate,
  LocalJudo,
  LocalBoxing,
  LocalWrestling,
  LocalMMA,
  LocalFencing,
  LocalArchery,
  LocalShooting,
  LocalPaintball,
  LocalLaserTag,
  LocalEscapeRoom,
  LocalArcade,
  LocalCasino,
  LocalLottery,
  LocalBingo,
  LocalPoker,
  LocalChess,
  LocalCheckers,
  LocalBackgammon,
  LocalMahjong,
  LocalScrabble,
  LocalMonopoly,
  LocalRisk,
  LocalSettlers,
  LocalCatan,
  LocalTicketToRide,
  LocalPandemic,
  LocalCodenames,
  LocalDixit,
  LocalMysterium,
  LocalBetrayal,
  LocalDeadOfWinter,
  LocalArkhamHorror,
  LocalEldritchHorror,
  LocalMansionsOfMadness,
  LocalTerraformingMars,
  LocalWingspan,
  LocalScythe,
  LocalGloomhaven,
  LocalSpiritIsland,
  LocalRoot,
  LocalVast,
  LocalMechsVsMinions,
  LocalRisingSun,
  LocalBloodRage,
  LocalAnkh,
  LocalGodfather,
  LocalCyclades,
  LocalKemet,
  LocalInis,
  LocalIwari,
  LocalYamatai,
  LocalFiveTribes,
  LocalIstanbul,
  LocalMarcoPolo,
  LocalVoyagesOfMarcoPolo,
  LocalOrleans,
  LocalAlchemists,
  LocalDungeonPetz,
  LocalDungeonLords,
  LocalLastWill,
  LocalProdigalsClub,
  LocalAdrenaline,
  LocalSpaceAlert,
  LocalGalaxyTrucker,
  LocalDungeonQuest,
  LocalHeroQuest,
  LocalDescent,
  LocalImperialAssault,
  LocalElderSign,
  LocalCthulhuWars,
  LocalCthulhuDeathMayDie,
  LocalMythosTales,
  LocalCallOfCthulhu,
  LocalTrailOfCthulhu,
  LocalDeltaGreen,
  LocalUnknownArmies,
  LocalOverTheEdge,
  LocalParanoia,
  LocalShadowrun,
  LocalCyberpunk,
  LocalVampire,
  LocalWerewolf,
  LocalMage,
  LocalChangeling,
  LocalWraith,
  LocalMummy,
  LocalDemon,
  LocalBeast,
  LocalDeviant,
  LocalPromethean,
  LocalGeist,
  LocalHunter,
  LocalMortal,
  LocalOrpheus,
  LocalScion,
  LocalExalted,
  LocalTrinity,
  LocalAberrant,
  LocalAdventure,
  LocalAeon,
  LocalTrinityContinuum,
  LocalScionOrigin,
  LocalScionHero,
  LocalScionDemigod,
  LocalScionGod,
  LocalExaltedEssence,
  LocalExaltedThirdEdition,
  LocalExaltedLunars,
  LocalExaltedSidereals,
  LocalExaltedAbyssals,
  LocalExaltedInfernals,
  LocalExaltedAlchemicals,
  LocalExaltedDragonBlooded,
  LocalExaltedGetimians,
  LocalExaltedLiminals,
  LocalExaltedDreamSouled,
  LocalExaltedHeartEaters,
  LocalExaltedUmbrals
} from '@mui/icons-material';

// Icônes organisées par catégories (utilisant seulement les icônes existantes)
const ICON_CATEGORIES = {
  'Général': [
    { icon: Category, label: 'Catégorie' },
    { icon: TrendingDown, label: 'Dépense' },
    { icon: TrendingUp, label: 'Revenu' },
    { icon: AttachMoney, label: 'Argent' },
    { icon: MonetizationOn, label: 'Monétisation' }
  ],
  'Transport': [
    { icon: DirectionsCar, label: 'Voiture' },
    { icon: LocalTaxi, label: 'Taxi' },
    { icon: DirectionsBus, label: 'Bus' },
    { icon: Train, label: 'Train' },
    { icon: DirectionsSubway, label: 'Métro' },
    { icon: Flight, label: 'Avion' },
    { icon: LocalShip, label: 'Bateau' },
    { icon: DirectionsBike, label: 'Vélo' },
    { icon: LocalScooterRental, label: 'Scooter' }
  ],
  'Alimentation': [
    { icon: Restaurant, label: 'Restaurant' },
    { icon: LocalDining, label: 'Dîner' },
    { icon: LocalCafe, label: 'Café' },
    { icon: LocalPizza, label: 'Pizza' },
    { icon: LocalBar, label: 'Bar' },
    { icon: LocalWineBar, label: 'Vin' },
    { icon: LocalBrewery, label: 'Bière' },
    { icon: LocalBakery, label: 'Boulangerie' },
    { icon: LocalButcher, label: 'Boucherie' },
    { icon: LocalFishMarket, label: 'Poissonnerie' }
  ],
  'Shopping': [
    { icon: ShoppingCart, label: 'Shopping' },
    { icon: LocalGroceryStore, label: 'Épicerie' },
    { icon: LocalMall, label: 'Centre commercial' },
    { icon: LocalConvenienceStore, label: 'Convenience' },
    { icon: LocalMarket, label: 'Marché' },
    { icon: LocalGardenCenter, label: 'Jardinage' },
    { icon: LocalPetStore, label: 'Animalerie' }
  ],
  'Logement': [
    { icon: Home, label: 'Maison' },
    { icon: LocalParking, label: 'Parking' },
    { icon: Build, label: 'Réparation' },
    { icon: LocalPlumber, label: 'Plomberie' },
    { icon: LocalElectrician, label: 'Électricité' },
    { icon: LocalCarpenter, label: 'Menuiserie' },
    { icon: LocalPaint, label: 'Peinture' }
  ],
  'Santé': [
    { icon: LocalHospital, label: 'Hôpital' },
    { icon: LocalClinic, label: 'Clinique' },
    { icon: LocalDentist, label: 'Dentiste' },
    { icon: LocalPharmacy, label: 'Pharmacie' },
    { icon: LocalOptician, label: 'Opticien' },
    { icon: LocalVet, label: 'Vétérinaire' },
    { icon: LocalSpa, label: 'Spa' },
    { icon: LocalBeautySalon, label: 'Beauté' },
    { icon: LocalBarberShop, label: 'Coiffeur' }
  ],
  'Loisirs': [
    { icon: SportsEsports, label: 'Jeux vidéo' },
    { icon: LocalMovies, label: 'Cinéma' },
    { icon: LocalTheater, label: 'Théâtre' },
    { icon: MusicNote, label: 'Musique' },
    { icon: LocalArtGallery, label: 'Art' },
    { icon: Museum, label: 'Musée' },
    { icon: LocalZoo, label: 'Zoo' },
    { icon: Park, label: 'Parc' },
    { icon: BeachAccess, label: 'Plage' },
    { icon: Pool, label: 'Piscine' },
    { icon: LocalGym, label: 'Gym' },
    { icon: LocalFitnessCenter, label: 'Fitness' }
  ],
  'Éducation': [
    { icon: School, label: 'École' },
    { icon: LocalLibrary, label: 'Bibliothèque' },
    { icon: Work, label: 'Travail' },
    { icon: Business, label: 'Business' },
    { icon: Computer, label: 'Informatique' }
  ],
  'Finance': [
    { icon: AccountBalance, label: 'Banque' },
    { icon: AccountBalanceWallet, label: 'Portefeuille' },
    { icon: LocalPostOffice, label: 'Poste' },
    { icon: LocalPrintshop, label: 'Impression' }
  ],
  'Services': [
    { icon: Person, label: 'Personne' },
    { icon: LocalLaundryService, label: 'Blanchisserie' },
    { icon: LocalCarWash, label: 'Lavage auto' },
    { icon: LocalDryCleaning, label: 'Nettoyage à sec' },
    { icon: CleaningServices, label: 'Ménage' },
    { icon: Security, label: 'Sécurité' }
  ]
};

const IconSelector = ({ open, onClose, onSelect, currentIcon = 'Category' }) => {
  const [selectedCategory, setSelectedCategory] = useState('Général');
  const [searchTerm, setSearchTerm] = useState('');

  const handleIconSelect = (iconName) => {
    onSelect(iconName);
    onClose();
  };

  const filteredCategories = Object.keys(ICON_CATEGORIES).filter(cat =>
    cat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredIcons = ICON_CATEGORIES[selectedCategory]?.filter(icon =>
    icon.label.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: 3,
          boxShadow: '0 16px 64px rgba(0, 0, 0, 0.2)'
        }
      }}
    >
      <DialogTitle sx={{ 
        fontWeight: 700,
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        Sélectionner une icône
        <Button onClick={onClose} color="inherit">
          <Cancel />
        </Button>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 2 }}>
        {/* Barre de recherche */}
        <TextField
          fullWidth
          label="Rechercher une icône"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: <InputAdornment position="start">🔍</InputAdornment>
          }}
        />

        {/* Catégories d'icônes */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Catégories
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {filteredCategories.map((category) => (
              <Chip
                key={category}
                label={category}
                onClick={() => setSelectedCategory(category)}
                color={selectedCategory === category ? 'primary' : 'default'}
                variant={selectedCategory === category ? 'filled' : 'outlined'}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>
        </Box>

        {/* Grille d'icônes */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            {selectedCategory}
          </Typography>
          <Grid container spacing={2}>
            {filteredIcons.map((iconData) => {
              const IconComponent = iconData.icon;
              const isSelected = currentIcon === iconData.icon.name;
              
              return (
                <Grid item xs={6} sm={4} md={3} key={iconData.icon.name}>
                  <Box
                    sx={{
                      p: 2,
                      border: isSelected ? '2px solid #2196f3' : '1px solid rgba(0, 0, 0, 0.1)',
                      borderRadius: 2,
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                      },
                      backgroundColor: isSelected ? 'rgba(33, 150, 243, 0.1)' : 'transparent'
                    }}
                    onClick={() => handleIconSelect(iconData.icon.name)}
                  >
                    <IconComponent 
                      sx={{ 
                        fontSize: 32, 
                        color: isSelected ? '#2196f3' : '#666',
                        mb: 1
                      }} 
                    />
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: 'block',
                        color: isSelected ? '#2196f3' : '#666',
                        fontWeight: isSelected ? 600 : 400
                      }}
                    >
                      {iconData.label}
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default IconSelector; 