/* eslint-disable ts/no-unsafe-return */
/* eslint-disable ts/no-unsafe-member-access */
/* eslint-disable ts/no-unsafe-assignment */
import { expect } from 'vitest';

export const expectError = async (res: Response, expectedStatus: number, expectedError?: string) => {
    expect(res.status).toBe(expectedStatus);

    const data = await res.json();

    expect(data).toMatchObject({ success: false });

    const errorPayload = data.error as unknown;
    const errorText =
        typeof errorPayload === 'string'
            ? errorPayload
            : errorPayload != null && typeof errorPayload === 'object' && 'message' in errorPayload
              ? String((errorPayload as { message: unknown }).message)
              : JSON.stringify(errorPayload);

    if (expectedError != null) {
        expect(errorText).toContain(expectedError);
    }

    return data;
};
