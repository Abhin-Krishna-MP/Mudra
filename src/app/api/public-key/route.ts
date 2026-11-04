import { NextResponse } from 'next/server';
import { publicKeys, signingKey } from '@/lib/signing';
export const runtime = 'nodejs';
export async function GET() { return NextResponse.json({ signing: !!signingKey(), keys: publicKeys() }); }
