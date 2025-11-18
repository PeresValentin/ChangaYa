import type { SkillItem } from "../../components/profile/SkillsList";
import type { ReviewItemProps } from "../../components/profile/ReviewItem";

export type ApiPerfil = {
  descripcion?: string | null;
  foto?: string | null;
  fotoURL?: string | null;
  perfilID?: string | number;
  usuarioID?: string | number;
};

export type ApiUser = {
  usuarioID?: string | number;
  usuarioId?: string | number;
  id?: string | number;
  _id?: string | number;
  userId?: string | number;
  tipoUsuario?: string | null;
  nombre?: string | null;
  apellido?: string | null;
  nombreUsuario?: string | null;
  nombreCompleto?: string | null;
  ubicacion?: string | null;
  direccion?: string | null;
  ciudad?: string | null;
  provincia?: string | null;
  email?: string | null;
  correo?: string | null;
  correoElectronico?: string | null;
  mail?: string | null;
  telefono?: string | number | null;
  telefono1?: string | number | null;
  celular?: string | number | null;
  phone?: string | number | null;
  descripcion?: string | null;
  sobreMi?: string | null;
  habilidades?: string[] | string | null;
  rankingGeneral?: number | null;
  changasCompletadas?: number | null;
  changasRealizadas?: number | null;
  rol?: string | null;
  created_at?: string | null;
  createdAt?: string | null;
  fechaCreacion?: string | null;
  fechaRegistro?: string | null;
  fechaAlta?: string | null;
  foto?: string | null;
  avatarUrl?: string | null;
  avatar?: string | null;
};

export type PublicProfile = {
  id: string;
  name: string;
  location: string;
  rating: number;
  completedJobs?: number;
  role?: string | null;
  generalScore?: number | null;
  email?: string | null;
  phone?: string | null;
  about: string;
  topSkills: SkillItem[];
  reviews: ReviewItemProps[];
  avatarUrl?: string | null;
  joinedAt?: string | null;
};

export const sanitizeText = (value?: string | null) => {
  if (!value || typeof value !== "string") {
    return "";
  }
  return value.trim();
};

export const buildDisplayName = (user: ApiUser) => {
  const composed =
    [sanitizeText(user.nombre), sanitizeText(user.apellido)]
      .filter(Boolean)
      .join(" ")
      .trim();

  const candidates = [
    sanitizeText(user.nombreCompleto),
    composed,
    sanitizeText(user.nombreUsuario),
  ];
  const valid = candidates.find((candidate) => Boolean(candidate));
  return valid || "Usuario";
};

export const buildLocation = (user: ApiUser) => {
  const locationCandidates = [
    sanitizeText(user.ubicacion),
    sanitizeText(user.direccion),
    [sanitizeText(user.ciudad), sanitizeText(user.provincia)]
      .filter(Boolean)
      .join(", "),
  ]
    .map((candidate) => candidate.trim())
    .filter(Boolean);

  return locationCandidates[0] || "Ubicación sin especificar";
};

export const parseSkills = (skills: ApiUser["habilidades"]): SkillItem[] => {
  if (!skills) return [];

  const normalizedArray = Array.isArray(skills)
    ? skills
    : String(skills)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

  return normalizedArray.map((label, index) => ({
    id: `${label}-${index}`,
    label,
    level: Math.max(0.3, 1 - index * 0.15),
  }));
};
export const buildEmail = (user: ApiUser) => {
  const candidates = [user.email, user.correoElectronico, user.correo, user.mail]
    .map((candidate) => sanitizeText(candidate as string | null))
    .filter(Boolean);

  return candidates[0] || null;
};

export const buildPhone = (user: ApiUser) => {
  const candidates = [user.telefono, user.telefono1, user.celular, user.phone]
    .map((candidate) => (candidate != null ? String(candidate).trim() : ""))
    .filter(Boolean);

  return candidates[0] || null;
};

const parseDateValue = (value?: string | number | null) => {
  if (value === undefined || value === null) return null;
  const parsed = typeof value === "number" ? new Date(value) : new Date(String(value));
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
};

const buildJoinedDate = (user: ApiUser) => {
  const candidates = [
    user.created_at,
    user.createdAt,
    user.fechaCreacion,
    user.fechaRegistro,
    user.fechaAlta,
  ];

  for (const candidate of candidates) {
    const parsed = parseDateValue(candidate ?? null);
    if (parsed) {
      return parsed;
    }
  }

  return null;
};

const buildAvatarUrl = (user: ApiUser, perfil: ApiPerfil | null) => {
  const candidates = [
    sanitizeText(perfil?.fotoURL ?? null),
    sanitizeText((perfil?.foto as string) ?? null),
    sanitizeText((user as any)?.avatarUrl ?? null),
    sanitizeText((user as any)?.avatar ?? null),
    sanitizeText((user as any)?.foto ?? null),
  ].filter(Boolean);

  return candidates[0] || null;
};


export const mapUserToPublicProfile = (
  user: ApiUser,
  perfil: ApiPerfil | null,
  fallbackId: string,
  extras?: Partial<Pick<PublicProfile, "reviews" | "topSkills">>,
): PublicProfile => {
  const rating = typeof user.rankingGeneral === "number" ? user.rankingGeneral : 0;
  const normalizedScore = rating > 0 ? Math.min(1, Math.max(0, rating / 5)) : null;
  const completedJobs =
    typeof user.changasCompletadas === "number"
      ? user.changasCompletadas
      : typeof user.changasRealizadas === "number"
      ? user.changasRealizadas
      : undefined;
      const topSkills = extras?.topSkills ?? parseSkills(user.habilidades);
  const reviews = extras?.reviews ?? [];

  const aboutText =
    sanitizeText(perfil?.descripcion) ||
    sanitizeText(user.descripcion) ||
    sanitizeText(user.sobreMi) ||
    "Este usuario aún no agregó una descripción.";

  const profileId =
    user.usuarioID ?? user.usuarioId ?? user.id ?? user._id ?? user.userId ?? fallbackId;

  return {
    id: String(profileId),
    name: buildDisplayName(user),
    location: buildLocation(user),
    rating,
     role: user.tipoUsuario ?? user.rol ?? null,
    completedJobs,
    generalScore: normalizedScore,
      email: buildEmail(user),
    phone: buildPhone(user),
      avatarUrl: buildAvatarUrl(user, perfil),
    joinedAt: buildJoinedDate(user),
    about: aboutText,
     topSkills,
    reviews,
  };
};

export const buildInitials = (name: string) => {
  if (!name) return "?";
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return initials || name.charAt(0).toUpperCase() || "?";
};