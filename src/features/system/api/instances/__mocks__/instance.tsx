import axios from 'axios';
import { AppInstance } from '../instance';

export async function UpdateInstanceAPI(instanceId: string, to: string) {
  return new Promise((resolve, reject) => {
    instanceId ? resolve(1) : reject(new Error('Mock: Failed to update instance.'));
  });
}

export async function UpdateInstances(instances: AppInstance[], to: string): Promise<number[]> {
  return new Promise((resolve, reject) => {
    instances ? resolve([1, 2, 3]) : reject(new Error('Mock: Failed to update instances.'));
  });
}
