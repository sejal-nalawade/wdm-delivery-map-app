-- CreateTable
CREATE TABLE "MapSettings" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "sameDayMode" TEXT NOT NULL DEFAULT 'default',
    "sameDayImageUrl" TEXT,
    "sameDayGeoJson" TEXT,
    "sameDayZoomLevel" INTEGER NOT NULL DEFAULT 11,
    "sameDayCenter" TEXT DEFAULT '{"lat":40.7128,"lng":-74.0060}',
    "sameDayTileProvider" TEXT,
    "sameDayTileApiKey" TEXT,
    "sameDayPins" TEXT DEFAULT '[]',
    "scheduledMode" TEXT NOT NULL DEFAULT 'default',
    "scheduledImageUrl" TEXT,
    "scheduledGeoJson" TEXT,
    "scheduledZoomLevel" INTEGER NOT NULL DEFAULT 4,
    "scheduledCenter" TEXT DEFAULT '{"lat":39.8283,"lng":-98.5795}',
    "scheduledTileProvider" TEXT,
    "scheduledTileApiKey" TEXT,
    "scheduledPins" TEXT DEFAULT '[]',
    "toggleTextSameDay" TEXT NOT NULL DEFAULT 'Same Day Delivery',
    "toggleTextScheduled" TEXT NOT NULL DEFAULT 'Scheduled Delivery',
    "buttonColor" TEXT NOT NULL DEFAULT '#000000',
    "buttonActiveColor" TEXT NOT NULL DEFAULT '#000000',
    "buttonInactiveColor" TEXT NOT NULL DEFAULT '#666666',
    "buttonAlignment" TEXT NOT NULL DEFAULT 'center',
    "buttonShape" TEXT NOT NULL DEFAULT 'rounded',
    "defaultMode" TEXT NOT NULL DEFAULT 'sameDay',
    "showDescription" BOOLEAN NOT NULL DEFAULT true,
    "descriptionSameDay" TEXT NOT NULL DEFAULT 'We deliver same-day within the NYC metropolitan area.',
    "descriptionScheduled" TEXT NOT NULL DEFAULT 'Scheduled delivery available nationwide.',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MapSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryPin" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "deliveryMode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#FF0000',
    "hasRadius" BOOLEAN NOT NULL DEFAULT false,
    "radiusDistance" DOUBLE PRECISION,
    "radiusUnit" TEXT NOT NULL DEFAULT 'km',
    "fillColor" TEXT NOT NULL DEFAULT '#5dade2',
    "borderColor" TEXT NOT NULL DEFAULT '#5dade2',
    "borderThickness" INTEGER NOT NULL DEFAULT 1,
    "fillOpacity" DOUBLE PRECISION NOT NULL DEFAULT 0.25,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeliveryPin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MapSettings_shop_key" ON "MapSettings"("shop");

-- CreateIndex
CREATE INDEX "DeliveryPin_shop_idx" ON "DeliveryPin"("shop");

-- CreateIndex
CREATE INDEX "DeliveryPin_deliveryMode_idx" ON "DeliveryPin"("deliveryMode");