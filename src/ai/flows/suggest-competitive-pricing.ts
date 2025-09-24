'use server';

/**
 * @fileOverview An AI agent that suggests competitive pricing strategies for rental properties.
 *
 * - suggestCompetitivePricing - A function that handles the pricing suggestion process.
 * - SuggestCompetitivePricingInput - The input type for the suggestCompetitivePricing function.
 * - SuggestCompetitivePricingOutput - The return type for the suggestCompetitivePricing function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCompetitivePricingInputSchema = z.object({
  propertyDescription: z
    .string()
    .describe('Detailed description of the rental property.'),
  country: z.string().describe('The country where the property is located.'),
  city: z.string().describe('The city where the property is located.'),
  neighborhood: z.string().describe('The neighborhood of the property.'),
  propertyType: z
    .string()
    .describe('The type of property (e.g., Apartment, House, Villa).'),
  numberOfBedrooms: z.number().describe('The number of bedrooms.'),
  numberOfBathrooms: z.number().describe('The number of bathrooms.'),
  amenities: z.string().describe('List of amenities offered at the property.'),
  season: z.string().describe('The current season or time of year.'),
  localEvents: z
    .string()
    .describe('Information about local events that may affect demand.'),
  occupancyRate: z
    .number()
    .describe('The current occupancy rate of the property.'),
  competitorPrices: z
    .string()
    .describe('A comma-separated list of competitor prices for similar properties.'),
  bookingWindow: z.string().describe('The booking window (e.g., "Last minute", "1-3 months in advance").'),
  currentPrice: z.number().describe('The current price of the rental.'),
});
export type SuggestCompetitivePricingInput = z.infer<
  typeof SuggestCompetitivePricingInputSchema
>;

const SuggestCompetitivePricingOutputSchema = z.object({
  suggestedPrice: z
    .number()
    .describe('The AI-suggested competitive price for the rental property.'),
  reasoning: z
    .string()
    .describe(
      'Explanation of why the suggested price is competitive, considering demand, seasonality, and local events.'
    ),
});
export type SuggestCompetitivePricingOutput = z.infer<
  typeof SuggestCompetitivePricingOutputSchema
>;

export async function suggestCompetitivePricing(
  input: SuggestCompetitivePricingInput
): Promise<SuggestCompetitivePricingOutput> {
  return suggestCompetitivePricingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCompetitivePricingPrompt',
  input: {schema: SuggestCompetitivePricingInputSchema},
  output: {schema: SuggestCompetitivePricingOutputSchema},
  prompt: `You are an AI-powered pricing tool for rental properties.

  Based on the following information, suggest a competitive price for the rental property and explain your reasoning:

  Property Description: {{{propertyDescription}}}
  Location: {{{neighborhood}}}, {{{city}}}, {{{country}}}
  Property Type: {{{propertyType}}}
  Bedrooms: {{{numberOfBedrooms}}}
  Bathrooms: {{{numberOfBathrooms}}}
  Amenities: {{{amenities}}}
  Season: {{{season}}}
  Local Events: {{{localEvents}}}
  Current Occupancy Rate: {{{occupancyRate}}}%
  Competitor Prices: {{{competitorPrices}}}
  Booking Window: {{{bookingWindow}}}
  Current Price: {{{currentPrice}}}

  Consider demand, seasonality, local events, property characteristics, competitor pricing, and booking window when determining the suggested price.
  Provide a brief explanation for your pricing recommendation.
  `,
});

const suggestCompetitivePricingFlow = ai.defineFlow(
  {
    name: 'suggestCompetitivePricingFlow',
    inputSchema: SuggestCompetitivePricingInputSchema,
    outputSchema: SuggestCompetitivePricingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
