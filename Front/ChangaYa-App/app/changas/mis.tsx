import { Ionicons } from '@expo/vector-icons';
import { Stack, usePathname, useRouter, type Href } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import theme from '../../constants/theme';

const { FONT, SPACING, RADIUS } = theme;
const palette = theme.Colors.light;

type JobStatus = 'abierta' | 'en_progreso' | 'finalizada';
type JobSubStatus = 'pendiente_seleccion' | 'pocos_candidatos' | 'en_curso' | 'completada';

interface Changa {
    id: string;
    title: string;
    description?: string;
    price: string;
    published?: string;
    dueDate?: string;
    status: JobStatus;
    subStatus: JobSubStatus; 
    postulantes?: number;
    trabajador?: {
        name: string;
        rating?: number;
    };
    icon: keyof typeof Ionicons.glyphMap;
}

const MIS_CHANGAS: Changa[] = [
    { 
        id: 'plomero-1', 
        title: 'Plomero - Baño Principal', 
        price: '$12.000', 
        published: 'Publicada hace 2 horas',
        description: 'Reparar canilla que gotea',
        status: 'abierta', 
        subStatus: 'pendiente_seleccion', 
        postulantes: 5, 
        icon: 'build-outline' 
    },
    { 
        id: 'limpieza-1', 
        title: 'Limpieza Casa Completa', 
        price: '$18.000', 
        published: 'Publicada ayer',
        description: '3 ambientes + cocina y baños',
        status: 'abierta', 
        subStatus: 'pocos_candidatos', 
        postulantes: 2, 
        icon: 'home-outline' 
    },
    { 
        id: 'delivery-1', 
        title: 'Delivery Zona Centro', 
        price: '$8.000', 
        dueDate: 'Comenzó hoy',
        description: 'Entrega de paquetes oficina',
        status: 'en_progreso', 
        subStatus: 'en_curso', 
        trabajador: { name: 'Carlos López', rating: 4.7 }, 
        icon: 'cube-outline' 
    },
    { 
        id: 'electricidad-1', 
        title: 'Electricidad - Comedor', 
        price: '$15.000', 
        dueDate: 'Completada 10/09',
        status: 'finalizada', 
        subStatus: 'completada', 
        trabajador: { name: 'Ana Martínez', rating: 5.0 }, 
        icon: 'flash-outline' 
    },
];

const summaryData = {
    totalMes: 6,
    calificacionPromedio: 4.8
};

const quickLinks: {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: Href;
}[] = [
  { id: "home", title: "Home", icon: "home-outline" as const, route: "/home/trabajador" as Href },
  {
    id: "chats",
    title: "Chats",
    icon: "chatbubble-ellipses-outline" as const,
    route: "/chats" as Href,
  },
  {
    id: "mis-changas",
    title: "Mis Changas",
    icon: "briefcase-outline" as const,
    route: "/changas" as Href,
  },
  {
    id: "perfil",
    title: "Perfil",
    icon: "person-circle-outline" as const,
    route: "/profile" as Href,
  },
];

const ChangaCard: React.FC<{ changa: Changa }> = ({ changa }) => {
    const router = useRouter();
    const getStatusStyle = (subStatus: JobSubStatus) => {
        switch (subStatus) {
            case 'pendiente_seleccion': return styles.badgeOpen;
            case 'pocos_candidatos': return styles.badgeOpenWarning; 
            case 'completada': return styles.badgeCompleted; 
            default: return styles.badgeOpen;
        }
    };
     const getStatusTextStyle = (subStatus: JobSubStatus) => {
        switch (subStatus) {
            case 'pendiente_seleccion': return styles.badgeTextOpen;
            case 'pocos_candidatos': return styles.badgeTextOpen; 
            case 'en_curso': return styles.badgeTextProgress;
            case 'completada': return styles.badgeTextCompleted; 
            default: return styles.badgeTextOpen;
        }
    };
    
    const getStatusText = (changa: Changa): string => {
         if (changa.postulantes && changa.status === 'abierta') return `${changa.postulantes} postulantes`;
         if (changa.subStatus === 'en_curso') return 'EN CURSO';
         if (changa.subStatus === 'completada') return `Completada ${changa.dueDate?.split(' ')[1] || ''}`;
         return '';
    }

    return (
        <TouchableOpacity 
            style={styles.card} 
            onPress={() => router.push({ pathname: "/changas/[id]", params: { id: changa.id, viewMode: 'contratante' } })}
        >
            <View style={styles.cardHeader}>
                <View style={styles.cardIconWrapper}>
                    <Ionicons name={changa.icon} size={22} color={palette.tint} />
                </View>
                <View style={styles.cardHeaderText}>
                    <Text style={styles.cardTitle}>{changa.title}</Text>
                     {changa.description && <Text style={styles.cardDescription}>{changa.description}</Text>}
                </View>
                 <View style={[styles.badgeBase, getStatusStyle(changa.subStatus)]}>
                      <Text style={[styles.badgeTextBase, getStatusTextStyle(changa.subStatus)]}>
                          {getStatusText(changa)}
                      </Text>
                 </View>
            </View>
            {(changa.price || changa.published || changa.dueDate || changa.trabajador) && <View style={styles.separator} />}

            <View style={styles.cardFooter}>
                    <View style={styles.metaRow}>
                        {changa.price && <><Ionicons name="cash-outline" size={16} color={palette.muted} /><Text style={styles.metaText}>{changa.price}</Text></>}
                        {changa.published && <><Ionicons name="time-outline" size={16} color={palette.muted} style={{ marginLeft: SPACING.sm }} /><Text style={styles.metaText}>{changa.published}</Text></>}
                        {changa.dueDate && changa.status !== 'finalizada' && <><Ionicons name="time-outline" size={16} color={palette.muted} style={{ marginLeft: SPACING.sm }} /><Text style={styles.metaText}>{changa.dueDate}</Text></>}
                    </View>
                    {changa.status === 'abierta' && changa.subStatus === 'pendiente_seleccion' && <Text style={styles.metaStateText}>Estado: Esperando tu elección</Text>}
                    {changa.status === 'abierta' && changa.subStatus === 'pocos_candidatos' && <Text style={styles.metaStateTextWarning}>Estado: Pocos candidatos</Text>}
                    {changa.trabajador && (
                        <View style={styles.metaRow}>
                            <Text style={styles.metaText}>Trabajador: {changa.trabajador.name}</Text>
                            {changa.trabajador.rating && <>
                                <Ionicons name="star" size={14} color="#FFC107" style={{ marginLeft: 4 }} />
                                <Text style={styles.metaTextBold}>{changa.trabajador.rating}</Text>
                            </>}
                        </View>
                    )}
                </View>
            </TouchableOpacity>
    );
};


export default function MisChangasScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeFilter, setActiveFilter] = useState<JobStatus>('abierta');

  const filteredChangas = useMemo(() => {
      return MIS_CHANGAS.filter(changa => changa.status === activeFilter);
  }, [activeFilter]);
  
  const changasPendientes = useMemo(() => filteredChangas.filter(c => c.subStatus === 'pendiente_seleccion' || c.subStatus === 'pocos_candidatos'), [filteredChangas]);
  const changasEnProgreso = useMemo(() => filteredChangas.filter(c => c.subStatus === 'en_curso'), [filteredChangas]);
  const changasFinalizadas = useMemo(() => MIS_CHANGAS.filter(c => c.status === 'finalizada'), []);
  
  const countPendientes = MIS_CHANGAS.filter(c => c.status === 'abierta').length;
  const countEnProgreso = MIS_CHANGAS.filter(c => c.status === 'en_progreso').length;
  const countFinalizadas = MIS_CHANGAS.filter(c => c.status === 'finalizada').length;

  return (
    <SafeAreaView style={styles.safeArea}>
        <Stack.Screen 
            options={{ 
                title: 'Mis Changas',
                headerTitleAlign: 'center',
                headerShadowVisible: false,
                headerRight: () => (
                    <TouchableOpacity 
                        style={{ marginRight: SPACING.md }}
                        onPress={() => router.push('/changas/nueva')}
                    >
                        <Ionicons name="add-circle-outline" size={28} color={palette.tint} />
                    </TouchableOpacity>
                ),
            }} 
        />
      <View style={styles.container}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
        >
            <View style={styles.filterContainer}>
                <TouchableOpacity 
                    style={[styles.filterButton, activeFilter === 'abierta' && styles.filterButtonActive]}
                    onPress={() => setActiveFilter('abierta')}
                >
                    <Text style={[styles.filterText, activeFilter === 'abierta' && styles.filterTextActive]}>Abiertas</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.filterButton, activeFilter === 'en_progreso' && styles.filterButtonActive]}
                    onPress={() => setActiveFilter('en_progreso')}
                >
                     <Text style={[styles.filterText, activeFilter === 'en_progreso' && styles.filterTextActive]}>En Progreso</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.filterButton, activeFilter === 'finalizada' && styles.filterButtonActive]}
                    onPress={() => setActiveFilter('finalizada')}
                >
                     <Text style={[styles.filterText, activeFilter === 'finalizada' && styles.filterTextActive]}>Finalizadas</Text>
                </TouchableOpacity>
            </View>

            
            {activeFilter === 'abierta' && changasPendientes.length > 0 && (
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Pendientes de selección ({countPendientes})</Text>
                    <View style={styles.cardList}>
                        {changasPendientes.map(changa => <ChangaCard key={changa.id} changa={changa} />)}
                    </View>
                </View>
            )}

             {activeFilter === 'en_progreso' && changasEnProgreso.length > 0 && (
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>En progreso ({countEnProgreso})</Text>
                    <View style={styles.cardList}>
                        {changasEnProgreso.map(changa => <ChangaCard key={changa.id} changa={changa} />)}
                    </View>
                </View>
            )}

             {activeFilter === 'finalizada' && changasFinalizadas.length > 0 && (
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Finalizadas ({countFinalizadas})</Text>
                    <View style={styles.cardList}>
                        {changasFinalizadas.slice(0, 1).map(changa => <ChangaCard key={changa.id} changa={changa} />)}
                    </View>
                    {countFinalizadas > 1 && (
                         <TouchableOpacity style={styles.viewAllButton}>
                             <Text style={styles.viewAllButtonText}>Ver todas las finalizadas ({countFinalizadas})</Text>
                         </TouchableOpacity>
                    )}
                </View>
            )}
            
            {filteredChangas.length === 0 && activeFilter !== 'finalizada' && (
                 <Text style={styles.noJobsText}>No tienes changas en estado "{activeFilter.replace('_', ' ')}".</Text>
            )}

            <View style={styles.summaryFooterCard}>
                 <Ionicons name="stats-chart-outline" size={20} color={palette.white} />
                 <Text style={styles.summaryFooterText}>
                     Resumen: {summaryData.totalMes} changas este mes
                 </Text>
                 <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                    <Ionicons name="star" size={16} color="#FFC107" />
                    <Text style={styles.summaryFooterRating}>{summaryData.calificacionPromedio}</Text>
                 </View>
            </View>

        </ScrollView>

        <View style={styles.bottomNav}>
          {quickLinks.map((item) => {
            const routePath =
              typeof item.route === "string"
                ? item.route
                : (item.route as any)?.pathname ?? String(item.route);
            const isHomeActive = item.id === "home" && (pathname === "/home/trabajador" || pathname.startsWith("/home/contratante"));
            const isMisChangasActive = item.id === "mis-changas" && pathname.startsWith('/changas');
            const isActive = isHomeActive || isMisChangasActive || (item.id !== "home" && item.id !== "mis-changas" && (pathname === routePath || pathname.startsWith(`${routePath}/`)));
            
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.navItem, isActive && styles.navItemActive]}
                onPress={() => router.push(item.id === 'home' ? ('/home/contratante' as Href) : item.route)} 
              >
                <Ionicons
                  name={item.icon}
                  size={22}
                  color={isActive ? palette.tint : palette.icon}
                />
                <Text style={[styles.navText, isActive && styles.navTextActive]}>
                  {item.title}
                </Text>
                {isActive ? <View style={styles.activeIndicator} /> : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: palette.background },
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: SPACING.lg * 6 },

  filterContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: SPACING.lg,
      gap: SPACING.sm,
  },
  filterButton: {
      paddingVertical: SPACING.xs + 2,
      paddingHorizontal: SPACING.md,
      borderRadius: RADIUS.lg,
      backgroundColor: palette.white,
      borderWidth: 1,
      borderColor: palette.border,
  },
  filterButtonActive: {
      backgroundColor: palette.tint,
      borderColor: palette.tint,
  },
  filterText: {
      fontSize: FONT.sm,
      color: palette.muted,
      fontWeight: '500' as const,
  },
  filterTextActive: {
      color: palette.white,
      fontWeight: '700' as const,
  },
  
  sectionContainer: {
      marginBottom: SPACING.lg,
  },
   sectionTitle: { 
    fontSize: FONT.lg, 
    fontWeight: "700" as const, 
    color: palette.icon,
    marginBottom: SPACING.sm,
  },
  cardList: { gap: SPACING.md },
  
   card: {
    backgroundColor: palette.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "flex-start",
    gap: SPACING.sm,
  },
  cardIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: palette.tabIconSelected,
    alignItems: "center",
    justifyContent: "center",
  },
  cardHeaderText: { flex: 1 },
  cardTitle: { 
    fontSize: FONT.lg, 
    fontWeight: "700" as const, 
    color: palette.icon 
  },
  cardDescription: { 
    marginTop: 2, 
    fontSize: FONT.md, 
    color: palette.muted 
  },
  badgeBase: {
    paddingVertical: 4, 
    paddingHorizontal: 10, 
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  badgeTextBase: {
    fontSize: FONT.sm,
    fontWeight: "600" as const,
  },
  badgeOpen: {
    backgroundColor: palette.tint, 
  },
  badgeTextOpen: {
    color: palette.white,
  },
  badgeOpenWarning: {
    backgroundColor: '#FFC107',
  },
  badgeProgress: {
    backgroundColor: "#FFA000", 
  },
  badgeTextProgress: {
    color: palette.white,
  },
  badgeCompleted: {
    backgroundColor: palette.background,
  },
  badgeTextCompleted: {
    color: palette.muted, 
  },
  separator: {
    height: 1,
    backgroundColor: palette.border,
    marginVertical: SPACING.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  metaRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 6,
  },
  metaText: { 
    fontSize: FONT.sm, 
    color: palette.muted,
  },
  metaTextBold: {
    fontSize: FONT.sm,
    color: palette.icon,
    fontWeight: '600' as const,
  },
  metaStateText: {
     fontSize: FONT.sm,
     color: palette.icon,
     fontStyle: 'italic',
  },
   metaStateTextWarning: {
     fontSize: FONT.sm,
     color: '#FFA000',
     fontWeight: '500' as const,
  },
  
  viewAllButton: {
      marginTop: SPACING.md,
      backgroundColor: palette.background,
      padding: SPACING.sm,
      borderRadius: RADIUS.md,
      alignItems: 'center',
  },
   viewAllButtonText: {
       color: palette.tint,
       fontWeight: '600' as const,
       fontSize: FONT.md,
  },
  
   noJobsText: {
       textAlign: 'center',
       color: palette.muted,
       fontSize: FONT.md,
       marginTop: SPACING.lg,
       marginBottom: SPACING.lg,
  },

  summaryFooterCard: {
      marginTop: SPACING.lg,
      backgroundColor: palette.icon,
      borderRadius: RADIUS.lg,
      padding: SPACING.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: SPACING.sm,
  },
  summaryFooterText: {
      color: palette.white,
      fontSize: FONT.sm,
      flex: 1,
  },
   summaryFooterRating: {
       color: palette.white,
       fontSize: FONT.sm,
       fontWeight: 'bold',
   },
  
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: palette.white,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
    elevation: 6,
  },
  navItem: { alignItems: "center", gap: 4, flex: 1, paddingVertical: SPACING.xs },
  navItemActive: { position: "relative" },
  navText: { fontSize: FONT.sm, color: palette.muted },
  navTextActive: { color: palette.tint, fontWeight: "600" as const },
  activeIndicator: {
    position: "absolute",
    bottom: -SPACING.xs,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.tint,
  }
});