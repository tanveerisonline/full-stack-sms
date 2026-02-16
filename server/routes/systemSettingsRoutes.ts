import { Router, type Request, type Response } from 'express';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db';
import { systemSettings, insertSystemSettingSchema, type SystemSetting } from '@shared/schemas';
import { authenticateToken, requireSuperAdmin, type AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(requireSuperAdmin);

// Get all system settings grouped by category
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const settings = await db
      .select()
      .from(systemSettings)
      .orderBy(systemSettings.category, systemSettings.key);

    // Group settings by category
    const groupedSettings = settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = {};
      }
      acc[setting.category][setting.key] = {
        id: setting.id,
        value: setting.value,
        description: setting.description,
        isEncrypted: setting.isEncrypted,
        updatedAt: setting.updatedAt,
      };
      return acc;
    }, {} as Record<string, Record<string, any>>);

    res.json({ settings: groupedSettings });
  } catch (error) {
    console.error('Error fetching system settings:', error);
    res.status(500).json({ message: 'Failed to fetch system settings' });
  }
});

// Get settings for a specific category
router.get('/:category', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category } = req.params;
    
    const settings = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.category, category))
      .orderBy(systemSettings.key);

    const settingsObject = settings.reduce((acc, setting) => {
      acc[setting.key] = {
        id: setting.id,
        value: setting.value,
        description: setting.description,
        isEncrypted: setting.isEncrypted,
        updatedAt: setting.updatedAt,
      };
      return acc;
    }, {} as Record<string, any>);

    res.json({ category, settings: settingsObject });
  } catch (error) {
    console.error('Error fetching category settings:', error);
    res.status(500).json({ message: 'Failed to fetch category settings' });
  }
});

// Update settings for a category (bulk update)
router.put('/:category', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category } = req.params;
    const { settings } = req.body;

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ message: 'Settings object is required' });
    }

    const userId = req.user!.id;
    const updatedSettings: SystemSetting[] = [];

    // Process each setting key-value pair
    for (const [key, settingData] of Object.entries(settings)) {
      const { value, description, isEncrypted = false } = settingData as any;

      // Check if setting exists
      const [existingSetting] = await db
        .select()
        .from(systemSettings)
        .where(and(
          eq(systemSettings.category, category),
          eq(systemSettings.key, key)
        ));

      if (existingSetting) {
        // Update existing setting
        await db
          .update(systemSettings)
          .set({
            value,
            description,
            isEncrypted,
            updatedBy: userId,
            updatedAt: new Date(),
          })
          .where(eq(systemSettings.id, existingSetting.id));

        const [updated] = await db
          .select()
          .from(systemSettings)
          .where(eq(systemSettings.id, existingSetting.id))
          .limit(1);
        
        updatedSettings.push(updated);
      } else {
        // Create new setting
        await db
          .insert(systemSettings)
          .values({
            category,
            key,
            value,
            description,
            isEncrypted,
            updatedBy: userId,
          });

        const [created] = await db
          .select()
          .from(systemSettings)
          .where(and(
            eq(systemSettings.category, category),
            eq(systemSettings.key, key)
          ))
          .limit(1);
        
        updatedSettings.push(created);
      }
    }

    res.json({ 
      message: 'Settings updated successfully',
      category,
      updatedSettings 
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Failed to update settings' });
  }
});

// Update a single setting
router.put('/:category/:key', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category, key } = req.params;
    const updateData = insertSystemSettingSchema.partial().parse(req.body);
    const userId = req.user!.id;

    // Check if setting exists
    const [existingSetting] = await db
      .select()
      .from(systemSettings)
      .where(and(
        eq(systemSettings.category, category),
        eq(systemSettings.key, key)
      ));

    let result: SystemSetting;

    if (existingSetting) {
      // Update existing setting
      await db
        .update(systemSettings)
        .set({
          ...updateData,
          updatedBy: userId,
          updatedAt: new Date(),
        })
        .where(eq(systemSettings.id, existingSetting.id));

      const [updated] = await db
        .select()
        .from(systemSettings)
        .where(eq(systemSettings.id, existingSetting.id))
        .limit(1);
      
      result = updated;
    } else {
      // Create new setting
      await db
        .insert(systemSettings)
        .values({
          category,
          key,
          ...updateData,
          updatedBy: userId,
        });

      const [created] = await db
        .select()
        .from(systemSettings)
        .where(and(
          eq(systemSettings.category, category),
          eq(systemSettings.key, key)
        ))
        .limit(1);
      
      result = created;
    }

    res.json({ 
      message: 'Setting updated successfully',
      setting: result 
    });
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ message: 'Failed to update setting' });
  }
});

// Delete a setting
router.delete('/:category/:key', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category, key } = req.params;

    const [deletedSetting] = await db
      .select()
      .from(systemSettings)
      .where(and(
        eq(systemSettings.category, category),
        eq(systemSettings.key, key)
      ))
      .limit(1);

    if (!deletedSetting) {
      return res.status(404).json({ message: 'Setting not found' });
    }

    await db
      .delete(systemSettings)
      .where(and(
        eq(systemSettings.category, category),
        eq(systemSettings.key, key)
      ));

    if (!deletedSetting) {
      return res.status(404).json({ message: 'Setting not found' });
    }

    res.json({ 
      message: 'Setting deleted successfully',
      deletedSetting 
    });
  } catch (error) {
    console.error('Error deleting setting:', error);
    res.status(500).json({ message: 'Failed to delete setting' });
  }
});

// Initialize default settings
router.post('/initialize', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    
    const defaultSettings = [
      // General Settings
      {
        category: 'general',
        key: 'school_name',
        value: 'EduManage Pro School',
        description: 'Name of the educational institution',
      },
      {
        category: 'general',
        key: 'admin_email',
        value: 'admin@edumanage.pro',
        description: 'Primary administrative email address',
      },
      {
        category: 'general',
        key: 'school_address',
        value: '',
        description: 'Physical address of the school',
      },
      {
        category: 'general',
        key: 'contact_phone',
        value: '',
        description: 'Primary contact phone number',
      },
      {
        category: 'general',
        key: 'website_url',
        value: '',
        description: 'Official website URL',
      },
      {
        category: 'general',
        key: 'timezone',
        value: 'UTC',
        description: 'Default timezone for the system',
      },
      
      // SMS Gateway Settings
      {
        category: 'sms_gateway',
        key: 'provider',
        value: 'twilio',
        description: 'SMS service provider (twilio, nexmo, etc.)',
      },
      {
        category: 'sms_gateway',
        key: 'api_key',
        value: '',
        description: 'SMS gateway API key',
        isEncrypted: true,
      },
      {
        category: 'sms_gateway',
        key: 'api_secret',
        value: '',
        description: 'SMS gateway API secret',
        isEncrypted: true,
      },
      {
        category: 'sms_gateway',
        key: 'sender_id',
        value: 'EDUMANAGE',
        description: 'SMS sender ID or phone number',
      },
      {
        category: 'sms_gateway',
        key: 'enabled',
        value: 'false',
        description: 'Enable or disable SMS notifications',
      },
      
      // Email Service Settings
      {
        category: 'email_service',
        key: 'provider',
        value: 'sendgrid',
        description: 'Email service provider (sendgrid, mailgun, smtp)',
      },
      {
        category: 'email_service',
        key: 'api_key',
        value: '',
        description: 'Email service API key',
        isEncrypted: true,
      },
      {
        category: 'email_service',
        key: 'from_email',
        value: 'no-reply@edumanage.pro',
        description: 'Default sender email address',
      },
      {
        category: 'email_service',
        key: 'from_name',
        value: 'EduManage Pro',
        description: 'Default sender name',
      },
      {
        category: 'email_service',
        key: 'smtp_host',
        value: '',
        description: 'SMTP server hostname (if using SMTP)',
      },
      {
        category: 'email_service',
        key: 'smtp_port',
        value: '587',
        description: 'SMTP server port',
      },
      {
        category: 'email_service',
        key: 'smtp_username',
        value: '',
        description: 'SMTP username',
      },
      {
        category: 'email_service',
        key: 'smtp_password',
        value: '',
        description: 'SMTP password',
        isEncrypted: true,
      },
      {
        category: 'email_service',
        key: 'enabled',
        value: 'false',
        description: 'Enable or disable email notifications',
      },
      
      // Payment Gateway Settings
      {
        category: 'payment_gateway',
        key: 'provider',
        value: 'stripe',
        description: 'Payment gateway provider (stripe, paypal, razorpay)',
      },
      {
        category: 'payment_gateway',
        key: 'public_key',
        value: '',
        description: 'Payment gateway public/publishable key',
      },
      {
        category: 'payment_gateway',
        key: 'secret_key',
        value: '',
        description: 'Payment gateway secret key',
        isEncrypted: true,
      },
      {
        category: 'payment_gateway',
        key: 'webhook_secret',
        value: '',
        description: 'Webhook endpoint secret for payment notifications',
        isEncrypted: true,
      },
      {
        category: 'payment_gateway',
        key: 'currency',
        value: 'USD',
        description: 'Default currency for payments',
      },
      {
        category: 'payment_gateway',
        key: 'enabled',
        value: 'false',
        description: 'Enable or disable online payments',
      },
      {
        category: 'payment_gateway',
        key: 'test_mode',
        value: 'true',
        description: 'Enable test mode for payments',
      },
    ];

    // Insert default settings if they don't exist
    const insertedSettings = [];
    for (const setting of defaultSettings) {
      const [existing] = await db
        .select()
        .from(systemSettings)
        .where(and(
          eq(systemSettings.category, setting.category),
          eq(systemSettings.key, setting.key)
        ));

      if (!existing) {
        await db
          .insert(systemSettings)
          .values({
            ...setting,
            updatedBy: userId,
          });

        const [inserted] = await db
          .select()
          .from(systemSettings)
          .where(and(
            eq(systemSettings.category, setting.category),
            eq(systemSettings.key, setting.key)
          ))
          .limit(1);
        insertedSettings.push(inserted);
      }
    }

    res.json({ 
      message: 'Default settings initialized successfully',
      insertedCount: insertedSettings.length,
      insertedSettings 
    });
  } catch (error) {
    console.error('Error initializing settings:', error);
    res.status(500).json({ message: 'Failed to initialize settings' });
  }
});

export default router;