<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTokensTable extends Migration
{
  /**
   * Run the migrations.
   *
   * @return void
   */
  public function up()
  {
    Schema::create('tokens', function (Blueprint $table) {
      $table->bigIncrements('id');
      $table->unsignedBigInteger('usuarios_id');
      $table->string('token', 1000);
      $table->dateTime('expired_at');
      $table->timestamps();
      $table->tinyInteger('is_active')->default(1);
      $table->foreign('usuarios_id')->references('id')->on('usuarios')->onUpdate('cascade')->onDelete('cascade');;
    });
  }

  /**
   * Reverse the migrations.
   *
   * @return void
   */
  public function down()
  {
    Schema::dropIfExists('tokens');
  }
}
