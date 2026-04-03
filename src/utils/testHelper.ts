/* eslint-disable ts/no-unsafe-return */
/* eslint-disable ts/no-unsafe-member-access */
/* eslint-disable ts/no-unsafe-assignment */
import { expect } from 'vitest';

export const expectError = async (res: Response, expectedStatus: number, expectedError?: string) => {
    expect(res.status).toBe(expectedStatus);

    const data = await res.json();

    expect(data).toMatchObject({
        success: false,
        error: expect.any(String)
    });

    if (expectedError != null) {
        expect(data.error).toContain(expectedError);
    }

    return data;
};
