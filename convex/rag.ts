import { google } from "@ai-sdk/google";
import { RAG } from "@convex-dev/rag";
import {
  defaultEmbeddingSettingsMiddleware,
  wrapEmbeddingModel,
} from "ai";
import { components } from "./_generated/api";

export const BRAND_CONSTITUTION_KEY = "brand-constitution";
export const BRAND_RAG_EMBEDDING_DIMENSION = 1536;

export function brandNamespace(brandId: string) {
  return `brand:${brandId}`;
}

const brandEmbeddingModel = wrapEmbeddingModel({
  model: google.embedding("gemini-embedding-001"),
  middleware: defaultEmbeddingSettingsMiddleware({
    settings: {
      providerOptions: {
        google: {
          outputDimensionality: BRAND_RAG_EMBEDDING_DIMENSION,
        },
      },
    },
  }),
  modelId: "gemini-embedding-001",
  providerId: "google",
});

export const brandRag = new RAG(components.rag, {
  textEmbeddingModel: brandEmbeddingModel,
  embeddingDimension: BRAND_RAG_EMBEDDING_DIMENSION,
});
