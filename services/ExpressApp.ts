import express, { Application } from 'express';
import compression from 'compression';
import path from 'path'
import { AdminRoutes, ShoppingRouter, VendorRoutes, CustomerRoutes } from '../routes'
import { gzipSync } from 'fflate';

export default async (app: Application) => {

    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    // gzip compression
    app.use(compression());
    app.use('/images', express.static(path.join(__dirname, 'images')))

    app.use('/admin', AdminRoutes);
    app.use('/vendor', VendorRoutes);
    app.use('/customer', CustomerRoutes)
    app.use(ShoppingRouter)

    return app;
}