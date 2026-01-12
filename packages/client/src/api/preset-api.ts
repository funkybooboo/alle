import { gql } from 'graphql-request';
import { graphqlClient } from './graphql-client';
import type { TagPreset, ColorPreset } from '../types/task.types';

// GraphQL Queries for Tag Presets
const GET_TAG_PRESETS = gql`
  query GetTagPresets {
    tagPresets {
      id
      name
      usageCount
      createdAt
    }
  }
`;

const CREATE_TAG_PRESET = gql`
  mutation CreateTagPreset($name: String!) {
    createTagPreset(name: $name) {
      id
      name
      usageCount
      createdAt
    }
  }
`;

const DELETE_TAG_PRESET = gql`
  mutation DeleteTagPreset($id: Int!) {
    deleteTagPreset(id: $id)
  }
`;

// GraphQL Queries for Color Presets
const GET_COLOR_PRESETS = gql`
  query GetColorPresets {
    colorPresets {
      id
      name
      hexValue
      position
      createdAt
    }
  }
`;

const CREATE_COLOR_PRESET = gql`
  mutation CreateColorPreset($name: String!, $hexValue: String!) {
    createColorPreset(name: $name, hexValue: $hexValue) {
      id
      name
      hexValue
      position
      createdAt
    }
  }
`;

const UPDATE_COLOR_PRESET = gql`
  mutation UpdateColorPreset($id: Int!, $name: String, $hexValue: String) {
    updateColorPreset(id: $id, name: $name, hexValue: $hexValue) {
      id
      name
      hexValue
      position
      createdAt
    }
  }
`;

const DELETE_COLOR_PRESET = gql`
  mutation DeleteColorPreset($id: Int!) {
    deleteColorPreset(id: $id)
  }
`;

// GraphQL response types
interface GraphQLTagPreset {
  id: number;
  name: string;
  usageCount: number;
  createdAt: string;
}

interface GraphQLColorPreset {
  id: number;
  name: string;
  hexValue: string;
  position: number;
  createdAt: string;
}

// Convert GraphQL types to frontend types
const toTagPreset = (gql: GraphQLTagPreset): TagPreset => ({
  id: gql.id,
  name: gql.name,
  usageCount: gql.usageCount,
  createdAt: gql.createdAt,
});

const toColorPreset = (gql: GraphQLColorPreset): ColorPreset => ({
  id: gql.id,
  name: gql.name,
  hexValue: gql.hexValue,
  position: gql.position,
  createdAt: gql.createdAt,
});

// API functions
export const presetAPI = {
  // Tag Presets
  async getTagPresets(): Promise<TagPreset[]> {
    const data = await graphqlClient.request<{
      tagPresets: GraphQLTagPreset[];
    }>(GET_TAG_PRESETS);
    return data.tagPresets.map(toTagPreset);
  },

  async createTagPreset(name: string): Promise<TagPreset> {
    const data = await graphqlClient.request<{
      createTagPreset: GraphQLTagPreset;
    }>(CREATE_TAG_PRESET, { name });
    return toTagPreset(data.createTagPreset);
  },

  async deleteTagPreset(id: number): Promise<boolean> {
    const data = await graphqlClient.request<{ deleteTagPreset: boolean }>(
      DELETE_TAG_PRESET,
      { id }
    );
    return data.deleteTagPreset;
  },

  // Color Presets
  async getColorPresets(): Promise<ColorPreset[]> {
    const data = await graphqlClient.request<{
      colorPresets: GraphQLColorPreset[];
    }>(GET_COLOR_PRESETS);
    return data.colorPresets.map(toColorPreset);
  },

  async createColorPreset(name: string, hexValue: string): Promise<ColorPreset> {
    const data = await graphqlClient.request<{
      createColorPreset: GraphQLColorPreset;
    }>(CREATE_COLOR_PRESET, { name, hexValue });
    return toColorPreset(data.createColorPreset);
  },

  async updateColorPreset(
    id: number,
    name?: string,
    hexValue?: string
  ): Promise<ColorPreset> {
    const data = await graphqlClient.request<{
      updateColorPreset: GraphQLColorPreset;
    }>(UPDATE_COLOR_PRESET, { id, name, hexValue });
    return toColorPreset(data.updateColorPreset);
  },

  async deleteColorPreset(id: number): Promise<boolean> {
    const data = await graphqlClient.request<{ deleteColorPreset: boolean }>(
      DELETE_COLOR_PRESET,
      { id }
    );
    return data.deleteColorPreset;
  },
};
