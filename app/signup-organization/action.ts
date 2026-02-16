"use server";

import { prisma } from "@/lib/prisma";

function slugify(name: string) {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

export async function signUpOrg(formData: FormData) {
    const company = formData.get("company");
    const website = formData.get("website");

    if (typeof company !== "string" || company.trim().length === 0) {
        throw new Error("Company name is required");
    }

    const name = company.trim();
    const slug = slugify(name);

    await prisma.organization.create({
        data: {
            id: crypto.randomUUID(),
            name,
            slug, // store just the slug like "acme-inc", not "org/acme-inc"
            // website: typeof website === "string" && website.trim() ? website.trim() : null, // if you add field
        },
    });
}
