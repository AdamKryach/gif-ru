import { Client, GatewayIntentBits, SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } from 'discord.js';
import { createLuckyWheelGif } from './lucky-wheel.js';
import 'dotenv/config';
import express from "express";

const app = express();
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ]
});

var listener = app.listen(process.env.PORT || 2000, function () {
    console.log('Your app is listening on port ' + listener.address().port);
});

app.listen(() => console.log("I'm Ready To Work..! 24H"));
app.get('/', (req, res) => {
    res.send(`<body><center><h1>Bot 24H ON!</h1></center></body>`);
});

const wheelCommand = new SlashCommandBuilder()
    .setName('wheel')
    .setDescription('إجراء سحب لاختيار فائز')
    .addUserOption(option =>
        option
            .setName('user')
            .setDescription('المستخدم الذي سيظهر في وسط العجلة')
            .setRequired(true)
    );

client.once('ready', async () => {
    console.log(`تم تسجيل الدخول كـ ${client.user.tag}`);
    
    try {
        await client.application.commands.create(wheelCommand);
        console.log('تم تسجيل الأمر بنجاح');
    } catch (error) {
        console.error('خطأ في تسجيل الأمر:', error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    if (interaction.commandName !== 'wheel') return;

    await interaction.deferReply();

    try {
        const user = interaction.options.getUser('user');

        // إنشاء GIF
        const gifBuffer = await createLuckyWheelGif(
            [{ value: "🎉 فوز", color: "#FFD700", percentage: 100 }], // مجرد تمثيل للدوائر
            0,
            user.displayAvatarURL({ extension: 'png', size: 256 })
        );

        const attachment = new AttachmentBuilder(gifBuffer, { name: 'lucky-wheel.gif' });

        await interaction.editReply({
            content: `👑 - ${user.toString()} فاز باللعبة!`,
            files: [attachment]
        });

    } catch (error) {
        console.error('خطأ:', error);
        await interaction.editReply('حدث خطأ أثناء تشغيل عجلة الحظ. الرجاء المحاولة مرة أخرى.');
    }
});

client.login(process.env.DISCORD_TOKEN);
