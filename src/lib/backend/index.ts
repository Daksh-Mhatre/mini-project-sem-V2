import { isSupabaseConfigured } from "../supabaseClient";
import { LocalBackend } from "./localBackend";
import { SupabaseBackend } from "./supabaseBackend";
import type { Backend } from "./types";

export const backend: Backend = isSupabaseConfigured ? new SupabaseBackend() : new LocalBackend();

export const BACKEND_MODE = backend.mode;

export type { Backend } from "./types";
