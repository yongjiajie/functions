import { Handler } from "@netlify/functions";

/**
 * Yields uppercase CRC-CCITT checksum according to ISO/IEC 13239.
 *
 * @link From https://www.tahapaksu.com/crc/js/crcmaster.js
 * @param payload Payload to calculate CRC from.
 * @param polynomial Polynomial to be used by CRC-CCITT checksum algorithm (default is `0x1021`)
 * @param initialValue Initial value to be used by CRC-CCITT checksum algorithm (default is `0xffff`)
 * @returns Uppercase 4-character string representing CRC-CCITT checksum, padded left with `0` if less than 4 characters.
 */
export const calculateCRC = (
  payload: string,
  polynomial = 0x1021,
  initialValue = 0xffff
): string => {
  let crc = initialValue;
  for (let c = 0; c < payload.length; c += 1) {
    crc ^= payload.charCodeAt(c) << 8; // eslint-disable-line no-bitwise
    for (let i = 0; i < 8; i += 1) {
      // eslint-disable-next-line no-bitwise
      if (crc & 0x8000) {
        crc = (crc << 1) ^ polynomial; // eslint-disable-line no-bitwise
      } else {
        crc <<= 1; // eslint-disable-line no-bitwise
      }
    }
  }
  const result = crc & 0xffff; // eslint-disable-line no-bitwise
  return result.toString(16).toUpperCase().padStart(4, "0");
};

const handler: Handler = async (event, context) => {
  let payload: string | undefined;
  if (event.queryStringParameters) {
    payload = event.queryStringParameters["payload"];

    if (!payload) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "No payload included in query string parameters!",
        }),
      };
    }

    return { statusCode: 200, body: calculateCRC(payload) };
  }

  return {
    statusCode: 400,
    body: JSON.stringify({
      message: "No payload included in query string parameters!",
    }),
  };
};

export { handler };
