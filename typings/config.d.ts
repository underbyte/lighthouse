/**
 * @license Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

import * as Gatherer from '../lighthouse-core/gather/gatherers/gatherer.js';
import * as Audit from '../lighthouse-core/audits/audit.js';

/** From type T, drop set of properties K */
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

declare global {
  module LH {
    /**
     * The full, normalized Lighthouse Config.
     */
    export interface Config {
      settings: Config.Settings;
      passes?: Config.Pass[];
      audits?: Config.AuditDefn[];
      categories?: Record<string, Config.Category>;
      groups?: Record<string, Config.Group>;
      // TODO(bckenny): should be Partial<> maybe? don't want to fail imported json
      artifacts?: Artifacts;
    }

    module Config {
      /**
       * The pre-normalization Lighthouse Config format.
       */
      export interface Json {
        settings?: SettingsJson;
        passes?: PassJson[];
        categories?: Record<string, CategoryJson>;
        groups?: GroupJson[];
        artifacts?: ArtifactsJson;
      }
  
      export interface SettingsJson extends SharedFlagsSettings {
        extraHeaders?: Crdp.Network.Headers;
      }
  
      export interface PassJson {
        passName: string;
        recordTrace?: boolean;
        useThrottling?: boolean;
        pauseAfterLoadMs?: number;
        networkQuietThresholdMs?: number;
        cpuQuietThresholdMs?: number;
        blockedUrlPatterns?: string[];
        blankPage?: string;
        blankDuration?: number;
        gatherers: GathererJson[];
      }
  
      export type GathererJson = {
        path: string;
        options?: {};
      } | {
        implementation: typeof Gatherer;
        options?: {};
      } | {
        instance: InstanceType<typeof Gatherer>;
        options?: {};
      } | string;

      export interface CategoryJson {
        name: string;
        description: string;
        audits: CategoryMemberJson[];
      }

      export interface GroupJson {
        title: string;
        description: string;
      }

      /**
       * A LH Artifacts object, but the traces and devtoolsLogs are replaced
       * with file paths of json files to import as those artifacts.
       */
      export interface ArtifactsJson extends Omit<Artifacts, 'traces'|'devtoolsLogs'> {
        traces: Record<string, string>;
        devtoolsLogs: Record<string, string>;
      }

      /**
       * Reference to an audit member of a category and how its score should be
       * weighted and how its results grouped with other members.
       */
      export interface CategoryMemberJson {
        id: string;
        weight: number;
        group?: string;
      }
  
      // TODO(bckenny): we likely don't want to require all these
      export type Settings = Required<SettingsJson>;
  
      export interface Pass extends Required<PassJson> {
        gatherers: GathererDefn[];
      }
  
      export interface GathererDefn {
        implementation: typeof Gatherer;
        instance: InstanceType<typeof Gatherer>;
        options: {};
      }

      export interface AuditDefn {
        implementation: typeof Audit;
        options: {};
      }

      // For now, these are unchanged from JSON version
      export interface CategoryMember extends CategoryMemberJson {}
      export interface Category extends CategoryJson {
        audits: CategoryMember[];
      }
      export interface Group extends GroupJson {}
    }
  }
}

// empty export to keep file a module
export {}
